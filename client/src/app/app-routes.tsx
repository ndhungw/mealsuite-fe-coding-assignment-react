import { Route, Routes } from 'react-router-dom';

import { lazy, Suspense } from 'react';
import { TicketDetailsSkeleton } from './ticket-details/ticket-details';
import { TicketsViewSkeleton } from './tickets/tickets';

const TicketsView = lazy(() => import('./tickets/tickets'));
const TicketDetailsView = lazy(() => import('./ticket-details/ticket-details'));

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Suspense fallback={<TicketsViewSkeleton />}>
            <TicketsView />
          </Suspense>
        }
      />
      <Route
        path='/:id'
        element={
          <Suspense fallback={<TicketDetailsSkeleton />}>
            <TicketDetailsView />
          </Suspense>
        }
      />
    </Routes>
  );
}
