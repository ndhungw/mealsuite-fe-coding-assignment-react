import { getTickets } from '@/apis/tickets';
import { queryOptions } from '@tanstack/react-query';
import { TICKET_QUERY_KEY_PREFIX } from './constants';

/**
 * completed: undefined => fetch all tickets
 * completed: true => fetch only completed tickets
 * completed: false => fetch only incomplete tickets
 */
export const createTicketsQueryOptions = ({ completed }: { completed?: boolean }) =>
  queryOptions({
    queryKey: [TICKET_QUERY_KEY_PREFIX, 'ticket-list', { completed }],
    queryFn: async ({ signal }) => {
      const allTickets = await getTickets({ signal });
      if (completed === undefined) {
        return allTickets;
      }
      return allTickets.filter((ticket) => ticket.completed === completed);
    },
  });
