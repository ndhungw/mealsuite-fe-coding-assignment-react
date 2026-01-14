import { assignUserToTicket, createTicket } from '@/apis/tickets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createTicketsQueryOptions } from '@/queries/tickets/create-tickets-query-options';
import { createUsersQueryOptions } from '@/queries/users/create-users-query-options';
import { User } from '@acme/shared-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PlusIcon } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import z from 'zod';
import { AssigneeCombobox } from '../../components/assignee-combobox';
import { TicketStatus } from '../../components/ticket-status';

export const TICKET_STATUS_FILTER_OPTIONS = [
  {
    label: 'All',
    value: undefined,
    component: <TicketStatus status={null}>All</TicketStatus>,
  },
  {
    label: 'Open',
    value: false,
    component: <TicketStatus status={false}>Open</TicketStatus>,
  },
  {
    label: 'Completed',
    value: true,
    component: <TicketStatus status={true}>Completed</TicketStatus>,
  },
] as const;

export function TicketsView() {
  return (
    <div>
      <div className='flex items-start justify-between gap-4 mb-6'>
        <div className=''>
          <h2 className='text-2xl font-semibold'>Tickets</h2>
          <p className='text-muted-foreground text-sm'>Manage your tickets efficiently</p>
        </div>
        <NewTicketModal />
      </div>
      <TicketsTable />
    </div>
  );
}

export default TicketsView;

/**
 * ===============
 */

export function TicketsTable() {
  const [filters, setFilters] = useState<{ completed: boolean | undefined }>({
    completed: undefined, // All tickets by default
  });

  const {
    isLoading: isLoadingTickets,
    isError: isErrorTickets,
    data: tickets,
  } = useQuery(createTicketsQueryOptions({ completed: filters.completed }));

  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useQuery(createUsersQueryOptions());

  const usersMap = useMemo(() => {
    const map: Record<number, User> = {};
    if (users) {
      users.forEach((user) => {
        map[user.id] = user;
      });
    }
    return map;
  }, [users]);

  return (
    <div
      // padding for fixed new ticket button at bottom on mobile
      className='space-y-4 pb-16'
    >
      <div>
        <div className='py-2 px-4 flex items-center gap-2 bg-background rounded border'>
          <span className='text-sm text-foreground font-medium'>Status: </span>
          <Select
            value={String(filters.completed)}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                completed: value === 'true' ? true : value === 'false' ? false : undefined,
              }));
            }}
          >
            <SelectTrigger className='w-36'>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent
              align='start'
              position='popper'
            >
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {TICKET_STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem
                    key={String(option.value)}
                    value={String(option.value)}
                  >
                    {option.component}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='w-full border border-border rounded bg-background'>
        <Table>
          <TableHeader className='bg-muted'>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingTickets ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='py-4'
                >
                  <Loader2Icon className='size-6 mx-auto text-ring animate-spin' />
                </TableCell>
              </TableRow>
            ) : isErrorTickets ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='py-4 text-center text-destructive'
                >
                  Error loading tickets
                </TableCell>
              </TableRow>
            ) : tickets && tickets.length > 0 ? (
              tickets?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className='font-medium'>
                    <Button
                      variant='link'
                      size='sm'
                      asChild
                      className='px-0'
                    >
                      <Link to={`/${ticket.id}`}>#{ticket.id}</Link>
                    </Button>
                  </TableCell>
                  <TableCell className='truncate max-w-[90vw]'>{ticket.description}</TableCell>
                  <TableCell>
                    {ticket.completed ? (
                      <Badge variant='default'>Completed</Badge>
                    ) : (
                      <Badge variant='secondary'>Open</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {ticket.assigneeId === null ? (
                      <span>Unassigned</span>
                    ) : (
                      <>
                        {isLoadingTickets ? (
                          <span>...</span>
                        ) : isErrorUsers ? (
                          <span>Unknown</span>
                        ) : (
                          <span>{usersMap[ticket.assigneeId]?.name || 'Unknown'}</span>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='py-4 text-center'
                >
                  No tickets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const newTicketFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .transform((val) => val.trim()),
  assigneeId: z.number().nullable(),
});

type NewTicketFormSchema = z.infer<typeof newTicketFormSchema>;

export function NewTicketModal() {
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewTicketFormSchema>({
    resolver: zodResolver(newTicketFormSchema),
    defaultValues: {
      description: '',
      assigneeId: null,
    },
  });

  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: NewTicketFormSchema) => {
      const ticket = await createTicket(data.description);

      if (data.assigneeId === null) {
        return ticket;
      }

      await assignUserToTicket({
        ticketId: ticket.id,
        userId: data.assigneeId!,
      });

      return { ...ticket, assigneeId: data.assigneeId! };
    },
    onSuccess: () => {
      setOpen(false);
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: createTicketsQueryOptions({ completed: undefined }).queryKey,
      });
    },
  });

  const onSubmit: SubmitHandler<NewTicketFormSchema> = (data) => {
    mutate(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <div
        className={cn([
          'max-sm:bg-background max-sm:fixed max-sm:bottom-0 max-sm:inset-x-0 max-sm:z-50 max-sm:px-4 max-sm:py-2 max-sm:border-t max-sm:shadow-t-lg shrink-0',
        ])}
      >
        <DialogTrigger asChild>
          <Button
            variant='default'
            className='max-sm:w-full'
          >
            <PlusIcon />
            New Ticket
          </Button>
        </DialogTrigger>
      </div>
      <DialogPortal>
        <DialogOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            className='sm:max-w-xl'
            onInteractOutside={(event) => {
              if (isPending) {
                event.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription className='sr-only'>
                Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4'>
              <div className='grid gap-3'>
                <label
                  className='text-sm'
                  htmlFor='description'
                >
                  Description
                </label>
                <Controller
                  name='description'
                  control={control}
                  render={({ field: { ref: _ref, ...field }, fieldState }) => (
                    <div>
                      <Textarea
                        id='description'
                        {...field}
                        placeholder='Enter ticket description here'
                        maxLength={200}
                        className={errors.description ? 'border-destructive' : ''}
                      />
                      {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </div>
                  )}
                />
              </div>
              <div className='grid gap-3'>
                <label
                  className='text-sm'
                  htmlFor='assignee'
                >
                  Assignee
                </label>
                <Controller
                  name='assigneeId'
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <AssigneeCombobox
                        className='w-full'
                        assigneeId={field.value}
                        onSelect={field.onChange}
                      />
                      {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </div>
                  )}
                ></Controller>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant='outline'
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant='default'
                type='submit'
                disabled={isPending}
              >
                {isPending ? <Loader2Icon className='animate-spin' /> : null}
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </DialogPortal>
    </Dialog>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className='text-destructive text-sm mt-1'>{children}</p>;
}

export function TicketsViewSkeleton() {
  return (
    <div>
      <div className='flex items-start justify-between gap-4 mb-6'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-4 w-64' />
        </div>
        <Skeleton className='h-10 w-32 rounded' />
      </div>

      <div className='space-y-4'>
        <div className='py-2 px-4 flex items-center gap-2 bg-background rounded border'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-10 w-36 rounded' />
        </div>

        <div className='w-full border border-border rounded bg-background'>
          <Table>
            <TableHeader className='bg-muted'>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className='h-5 w-8' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-full max-w-md' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-6 w-20 rounded-full' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-24' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
