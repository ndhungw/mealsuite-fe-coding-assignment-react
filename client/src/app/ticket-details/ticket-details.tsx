import {
  assignUserToTicket,
  markTicketAsComplete,
  markTicketAsIncomplete,
  unassignUserFromTicket,
} from '@/apis/tickets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TICKET_STATUS_OPTIONS, TicketStatusValueType } from '@/constants/ticket-status';
import { cn } from '@/lib/utils';
import { TICKET_QUERY_KEY_PREFIX } from '@/queries/tickets/constants';
import { createTicketQueryOptions } from '@/queries/tickets/create-ticket-query-options';
import { Ticket } from '@acme/shared-models';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AssigneeCombobox } from '../../components/assignee-combobox';

export function TicketDetailsView() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);

  if (!idParam || isNaN(id)) {
    return <div>Invalid ticket ID</div>;
  }

  return <TicketDetails id={id} />;
}

function TicketDetails({ id }: { id: number }) {
  const { data: ticketData, isLoading: isLoadingTicket } = useSuspenseQuery(
    createTicketQueryOptions({ id })
  );

  const queryClient = useQueryClient();

  const { isPending: isAssigning, mutate: mutateAssignee } = useMutation({
    mutationFn: async ({
      ticketId,
      userId,
    }: {
      ticketId: Ticket['id'];
      userId: Ticket['assigneeId'];
    }) => {
      if (userId === null) {
        await unassignUserFromTicket(ticketId);
      } else {
        await assignUserToTicket({ ticketId, userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TICKET_QUERY_KEY_PREFIX], // invalidate all ticket-related queries
      });
    },
  });

  const handleSelectAssignee = (assigneeId: number | null) => {
    if (assigneeId === ticketData.assigneeId) return;
    mutateAssignee({ ticketId: id, userId: assigneeId });
  };

  const [status, setStatus] = useState<string>(ticketData.completed ? 'completed' : 'open');

  const { isPending: isMarkingTicketAsCompleted, mutate: handleMarkTicketAsComplete } = useMutation(
    {
      mutationFn: async ({
        ticketId,
        newStatus,
      }: {
        ticketId: Ticket['id'];
        newStatus: TicketStatusValueType;
      }) => {
        if (newStatus === 'completed') {
          await markTicketAsComplete(ticketId);
        }
        if (newStatus === 'open') {
          await markTicketAsIncomplete(ticketId);
        }
        return newStatus;
      },
      onSuccess: (newStatus) => {
        queryClient.invalidateQueries({
          queryKey: [TICKET_QUERY_KEY_PREFIX], // invalidate all ticket-related queries
        });
        setStatus(newStatus);
      },
    }
  );

  const handleChangeStatus = (newStatus: string) => {
    handleMarkTicketAsComplete({ ticketId: id, newStatus: newStatus as TicketStatusValueType });
  };

  return (
    <div>
      <Link
        to='/'
        className='mb-4 py-2 flex items-center gap-2 text-sm text-primary hover:underline underline-offset-2'
      >
        <ArrowLeftIcon className='size-4' />
        Go to Ticket List
      </Link>

      <div className='space-y-4'>
        <div className='space-x-4'>
          <Badge
            variant={'default'}
            className='font-mono py-1 px-4 rounded text-base'
          >
            Ticket #{id}
          </Badge>
        </div>

        <div className='space-y-2'>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={status}
            onValueChange={handleChangeStatus}
          >
            <SelectTrigger
              className='w-36 bg-background'
              disabled={isLoadingTicket || isMarkingTicketAsCompleted}
            >
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent
              align='start'
              position='popper'
            >
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {TICKET_STATUS_OPTIONS.map((status) => (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                    disabled={
                      (status.value === 'completed' && ticketData.completed) ||
                      (status.value === 'open' && !ticketData.completed)
                    }
                  >
                    {status.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <FieldLabel>Assignee</FieldLabel>
          <AssigneeCombobox
            assigneeId={ticketData.assigneeId}
            onSelect={handleSelectAssignee}
            className='w-40'
            disabled={isLoadingTicket || isAssigning}
          />
          {ticketData.assigneeId && (
            <Button
              variant={'destructive'}
              className='ml-2'
              onClick={() => handleSelectAssignee(null)}
              disabled={isLoadingTicket || isAssigning}
            >
              Unassign
            </Button>
          )}
        </div>

        <div className='space-y-2'>
          <FieldLabel className='mb-2'>Description</FieldLabel>
          <div className='bg-background py-3 px-4 rounded border relative'>
            <p>{ticketData.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-sm font-medium', className)}>{children}</div>;
}

export function TicketDetailsSkeleton() {
  return (
    <div>
      <div className='mb-4 py-2 flex items-center gap-2'>
        <Skeleton className='h-4 w-4 rounded-full' />
        <Skeleton className='h-4 w-32' />
      </div>

      <div className='space-y-4'>
        <div className='space-x-4'>
          <Skeleton className='h-7 w-24 rounded' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-10 w-36 rounded' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-40 rounded' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-24 w-full rounded' />
        </div>
      </div>
    </div>
  );
}

export default TicketDetailsView;
