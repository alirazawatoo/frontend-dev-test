import { lazy } from 'react';

/** The return flow ships as its own chunk; most visits never open it. */
export const ReturnFlowPage = lazy(() =>
  import('../features/returns').then((m) => ({ default: m.ReturnFlowPage })),
);
