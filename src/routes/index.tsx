import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { OrdersPage, OrderDetailPage } from '../features/orders';
import { Layout } from './Layout';
import { ReturnFlowPage } from './lazyPages';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <OrdersPage /> },
      { path: '/orders/:orderId', element: <OrderDetailPage /> },
      { path: '/orders/:orderId/return', element: <ReturnFlowPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
