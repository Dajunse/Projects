import { ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardCardProps {
  title: string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const DashboardCard = ({ title, description, href, icon, onClick }: DashboardCardProps) => {
  const content = (
    <div
      className="flex h-32 w-full flex-col justify-between rounded-xl border border-border bg-card/60 p-4 text-left shadow-card transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{description}</span>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="flex items-center gap-1 text-xs text-primary">
        <ExternalLink size={14} />
        <span>{href ? href : 'Abrir'}</span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cn('focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background')}>
        {content}
      </a>
    );
  }

  return content;
};

export default DashboardCard;
