import { BrowserRouter, Link } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRoutes } from './app-routes';
import { ListTodo } from 'lucide-react';

const App = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </AppShell>
    </BrowserRouter>
  );
};

const queryClient = new QueryClient();

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className='bg-background shadow-2xs sticky top-0 z-50'>
        <div className='container mx-auto p-4'>
          <Link
            to='/'
            className='inline-flex items-center gap-2'
          >
            <ListTodo className='size-5 text-primary' />
            <h1 className='text-lg font-bold text-primary text-shadow-accent'>TASKEE</h1>
          </Link>
        </div>
      </header>
      <main className='bg-gray-50 flex-1'>
        <div className='container mx-auto p-4'>{children}</div>
      </main>
    </>
  );
}

export default App;
