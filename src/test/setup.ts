import '@testing-library/jest-dom/vitest';

// jsdom has no layout engine; OrdersPage scrolls to the top on page change.
window.scrollTo = () => {};
