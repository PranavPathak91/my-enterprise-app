import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

test('renders app', () => {
  render(<App />);
  const loginElement = screen.getByText(/Create your account/i);
  expect(loginElement).toBeInTheDocument();
});
