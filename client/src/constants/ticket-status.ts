export const TICKET_STATUS_OPEN = {
  label: 'Open',
  value: 'open',
} as const;

export const TICKET_STATUS_COMPLETED = {
  label: 'Completed',
  value: 'completed',
} as const;

export const TICKET_STATUS_OPTIONS = [TICKET_STATUS_OPEN, TICKET_STATUS_COMPLETED];

export type TicketStatusValueType =
  | (typeof TICKET_STATUS_OPEN)['value']
  | (typeof TICKET_STATUS_COMPLETED)['value'];
