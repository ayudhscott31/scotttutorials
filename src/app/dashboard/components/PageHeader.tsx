import { Button } from '@/app/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageHeader({ title, description, actionLabel, onAction }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button
          type="button"
          onClick={onAction}
          className="bg-nav-active text-nav-active-foreground hover:brightness-95"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
