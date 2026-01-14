import { getTicketById } from '@/apis/tickets';
import { Ticket } from '@acme/shared-models';
import { queryOptions } from '@tanstack/react-query';
import { TICKET_QUERY_KEY_PREFIX } from './constants';

/**
 * completed: undefined => fetch all tickets
 * completed: true => fetch only completed tickets
 * completed: false => fetch only incomplete tickets
 */
export const createTicketQueryOptions = ({ id }: { id: Ticket['id'] }) =>
  queryOptions({
    queryKey: [TICKET_QUERY_KEY_PREFIX, 'ticket-details', { id }],
    queryFn: ({ signal }) => {
      return getTicketById(id, { signal });
    },
  });
