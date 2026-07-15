import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { queryClient as appQueryClient } from '../lib';
import { routes } from '../routes';

/**
 * Fresh query client per test. Mutations keep the app's no-retry policy;
 * query retries are off so failure states show up without backoff delays.
 */
export function createTestQueryClient() {
  const defaults = appQueryClient.getDefaultOptions();
  return new QueryClient({
    defaultOptions: {
      queries: { ...defaults.queries, retry: false, staleTime: 0 },
      mutations: defaults.mutations,
    },
  });
}

/** Renders the real route table at `path`, as the browser would. */
export function renderRoute(path: string) {
  const client = createTestQueryClient();
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const utils = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...utils, router, client };
}
