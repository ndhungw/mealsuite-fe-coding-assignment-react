import { renderWithProviders } from '../../test-utils';
import TicketsView from './tickets';
import { waitFor, screen } from '@testing-library/react';

jest.mock('@/apis/tickets', () => ({
  getTickets: jest.fn().mockResolvedValue([
    {
      id: 1,
      description: 'Test ticket 1',
      assigneeId: null,
      completed: false,
    },
    {
      id: 2,
      description: 'Test ticket 2',
      assigneeId: 1,
      completed: true,
    },
  ]),
  createTicket: jest.fn().mockResolvedValue({
    id: 3,
    description: 'New ticket',
    assigneeId: null,
    completed: false,
  }),
}));

jest.mock('@/apis/users', () => ({
  getUsers: jest.fn().mockResolvedValue([
    { id: 1, name: 'User test 1' },
    { id: 2, name: 'User test 2' },
  ]),
}));

describe('Tickets', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<TicketsView />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(baseElement).toBeTruthy();
    });
  });

  it('should display ticket descriptions', async () => {
    renderWithProviders(<TicketsView />);

    await waitFor(() => {
      expect(screen.getByText('Test ticket 1')).toBeInTheDocument();
      expect(screen.getByText('Test ticket 2')).toBeInTheDocument();
    });
  });
});
