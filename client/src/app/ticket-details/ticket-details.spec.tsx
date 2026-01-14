import { renderWithProviders } from '../../test-utils';
import { TicketDetailsView } from './ticket-details';
import { waitFor, screen } from '@testing-library/react';

// Mock react-router-dom's useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

// Mock the API calls
jest.mock('@/apis/tickets', () => ({
  getTicketById: jest.fn().mockResolvedValue({
    id: 1,
    description: 'Test ticket description',
    assigneeId: null,
    completed: false,
  }),
  assignUserToTicket: jest.fn(),
  unassignUserFromTicket: jest.fn(),
  markTicketAsComplete: jest.fn(),
  markTicketAsIncomplete: jest.fn(),
}));

describe('TicketDetails', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<TicketDetailsView />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(baseElement).toBeTruthy();
    });
  });

  it('should display ticket description', async () => {
    renderWithProviders(<TicketDetailsView />);

    await waitFor(() => {
      expect(screen.getByText('Test ticket description')).toBeInTheDocument();
    });
  });
});
