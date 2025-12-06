// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like: expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// JSDOM doesn't include ResizeObserver — add a minimal mock for tests that rely on it (e.g. Recharts ResponsiveContainer)
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

// @ts-ignore
global.ResizeObserver = global.ResizeObserver || ResizeObserverMock;
