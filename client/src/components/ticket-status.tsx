import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function TicketStatus({
  status,
  className,
  children,
}: {
  status: boolean | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant='default'
      className={cn(
        {
          'text-gray-700 bg-gray-100': status === undefined,
          'text-blue-700 bg-blue-100': status === false,
          'text-green-700 bg-green-100': status === true,
        },
        className
      )}
    >
      {children}
    </Badge>
  );
}
