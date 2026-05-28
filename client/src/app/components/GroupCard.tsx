import { ImageWithFallback } from './ImageWithFallback';

interface GroupCardProps {
  name: string;
  image: string;
  cardCount: number;
  href?: string;
}

export function GroupCard({ name, image, cardCount, href }: GroupCardProps) {
  const content = (
    <>
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        <ImageWithFallback
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground">{cardCount.toLocaleString()} cards</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {content}
    </div>
  );
}
