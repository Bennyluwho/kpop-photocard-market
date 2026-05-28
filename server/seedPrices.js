import mongoose from "mongoose";
import dotenv from "dotenv";
import Card from "./models/Card.js";
import PriceHistory from "./models/PriceHistory.js";

dotenv.config();

const conditions = ["Mint", "Near Mint", "Excellent", "Lightly Played"];
const sources = ["manual", "mock-market", "seed"];

const popularIdols = new Set([
    "Jungkook",
    "V",
    "Jennie",
    "Lisa",
    "Sana",
    "Hanni",
    "Wonyoung",
    "Karina",
    "Hyunjin",
    "Felix",
    "Yeonjun",
    "Mark",
    "Sakura",
    "Wonbin",
]);

function fallbackBasePrice(card) {
    const typeBase = {
        "Album photocard": 12,
        "Lucky draw": 42,
        POB: 34,
        "Broadcast card": 125,
        "Tour photocard": 52,
        "Fanmeeting photocard": 58,
        "Merch photocard": 22,
        "Limited event card": 145,
    };

    const rarityMultiplier = {
        Standard: 1,
        Uncommon: 1.25,
        Rare: 1.75,
        "Ultra Rare": 2.35,
        Limited: 2,
        "Event Exclusive": 2.55,
    };

    const popularityMultiplier = popularIdols.has(card.idol) ? 1.35 : 1;
    const base = typeBase[card.cardType] ?? 18;

    return Number((base * (rarityMultiplier[card.rarity] ?? 1) * popularityMultiplier).toFixed(2));
}

function getBasePrice(card) {
    return Number(card.marketPrice ?? card.lastSale ?? card.askingPrice ?? fallbackBasePrice(card));
}

function entryCountForCard(card, index) {
    if (card.cardType === "Album photocard" && card.rarity === "Standard") {
        return 3 + (index % 3);
    }

    if (card.rarity === "Ultra Rare" || card.rarity === "Event Exclusive") {
        return 2 + (index % 4);
    }

    return 4 + (index % 5);
}

function soldDateForEntry(cardIndex, entryIndex) {
    const daysAgo = 8 + entryIndex * 14 + (cardIndex % 11);
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    return date;
}

function conditionForEntry(card, entryIndex) {
    if (card.condition && conditions.includes(card.condition) && entryIndex % 3 !== 2) {
        return card.condition;
    }

    return conditions[entryIndex % conditions.length];
}

function conditionMultiplier(condition) {
    const multipliers = {
        Mint: 1.08,
        "Near Mint": 1,
        Excellent: 0.9,
        "Lightly Played": 0.76,
    };

    return multipliers[condition] ?? 1;
}

function priceForEntry(card, basePrice, cardIndex, entryIndex, count) {
    const trend = popularIdols.has(card.idol) || card.rarity === "Event Exclusive" ? 0.035 : 0.015;
    const chronologicalPosition = count - entryIndex - 1;
    const marketMovement = 1 + chronologicalPosition * trend;
    const wave = 1 + ((((cardIndex + 1) * (entryIndex + 3)) % 9) - 4) / 25;
    const condition = conditionForEntry(card, entryIndex);
    const price = basePrice * marketMovement * wave * conditionMultiplier(condition);

    return Math.max(3, Number(price.toFixed(2)));
}

function confidenceForEntry(cardIndex, entryIndex) {
    return Number((0.75 + ((cardIndex + entryIndex) % 24) / 100).toFixed(2));
}

async function seedPrices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const cards = await Card.find({}).sort({ group: 1, idol: 1, album: 1 });

        if (!cards.length) {
            console.error("No cards found. Run npm run seed first.");
            process.exit(1);
        }

        await PriceHistory.deleteMany({});

        const entries = [];

        cards.forEach((card, cardIndex) => {
            const count = entryCountForCard(card, cardIndex);
            const basePrice = getBasePrice(card);

            for (let entryIndex = 0; entryIndex < count; entryIndex += 1) {
                const condition = conditionForEntry(card, entryIndex);

                entries.push({
                    cardId: card._id,
                    price: priceForEntry(card, basePrice, cardIndex, entryIndex, count),
                    source: sources[(cardIndex + entryIndex) % sources.length],
                    condition,
                    soldDate: soldDateForEntry(cardIndex, entryIndex),
                    confidence: confidenceForEntry(cardIndex, entryIndex),
                });
            }
        });

        await PriceHistory.insertMany(entries);

        console.log(`Seeded ${entries.length} price entries for ${cards.length} cards`);
        process.exit(0);
    } catch (error) {
        console.error("Failed to seed prices:", error.message);
        process.exit(1);
    }
}

seedPrices();
