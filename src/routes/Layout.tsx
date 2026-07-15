import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Spinner } from '../components';

/** The app shell layout. Every route renders inside this. */
export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-ink"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-surface px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link to="/" className="inline-block">
            <img
              src="/solvpath-logo.png"
              alt="solvpath home"
              className="h-7 w-auto"
            />
          </Link>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 px-4 py-8 focus:outline-none sm:px-6">
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
