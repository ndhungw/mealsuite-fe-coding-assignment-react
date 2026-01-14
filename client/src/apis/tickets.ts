import { Ticket, User } from '@acme/shared-models';
import { HttpClient } from './http-client';
import { RequestConfigs } from './shared/types';

const ticketApi = new HttpClient({ baseURL: '/api/tickets' });

export const getTickets = async (configs?: RequestConfigs) => {
  return await ticketApi.get<Ticket[]>('/', configs);
};

export const getTicketById = async (id: Ticket['id'], configs?: RequestConfigs) => {
  return await ticketApi.get<Ticket>(`/${id}`, configs);
};

export const createTicket = async (
  description: Ticket['description'],
  configs?: RequestConfigs
) => {
  return await ticketApi.post<Ticket>('/', { description }, configs);
};

export type AssignUserParams = {
  ticketId: Ticket['id'];
  userId: User['id'];
};
export const assignUserToTicket = async (
  { ticketId, userId }: AssignUserParams,
  configs?: RequestConfigs
) => {
  return await ticketApi.put(`/${ticketId}/assign/${userId}`, undefined, configs);
};

export const unassignUserFromTicket = async (ticketId: Ticket['id'], configs?: RequestConfigs) => {
  return await ticketApi.put(`/${ticketId}/unassign`, undefined, configs);
};

export const markTicketAsComplete = async (ticketId: Ticket['id'], configs?: RequestConfigs) => {
  return await ticketApi.put(`/${ticketId}/complete`, undefined, configs);
};

export const markTicketAsIncomplete = async (ticketId: Ticket['id'], configs?: RequestConfigs) => {
  return await ticketApi.delete(`/${ticketId}/complete`, configs);
};
