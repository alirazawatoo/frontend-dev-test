import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Spinner } from '@/components';
import { OrdersPage, OrderDetailPage } from '@/features/orders';
import { ReturnFlowPage } from '@/features/returns';

// Lazy-load the return flow so its bundle isn't included until needed.
const ReturnFlowPageLazy = lazy(() =>
  import('@/features/returns').then((m) => ({ default: m.ReturnFlowPage })),
);

/** The app shell layout. Every route renders inside this. */
function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <a href="/" className="inline-block">
            <img
              src="/solvpath-logo.png"
              alt="solvpath"
              className="h-7 w-auto"
            />
          </a>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <footer className="border-t border-line bg-surface px-4 py-6 text-center text-xs text-muted sm:px-6">
        <p>© 2026 solvpath · post-purchase platform</p>
      </footer>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner label="Loading" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <OrdersPage /> },
      { path: '/orders/:orderId', element: <OrderDetailPage /> },
      { path: '/orders/:orderId/return', element: <ReturnFlowPageLazy /> },
    ],
  },
]);
