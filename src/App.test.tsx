import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders trip review title', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /تقييم لرحلة عمرك/i })).toBeInTheDocument();
});
