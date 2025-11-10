import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsCard from '../StatsCard';
import '@testing-library/jest-dom';

describe('StatsCard', () => {
  it('renders the title, value, and icon', () => {
    const props = {
      title: 'Total Jobs',
      value: 1234,
      icon: '💼',
      color: 'blue' as const,
    };

    render(<StatsCard {...props} />);

    // Check if the title is rendered
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();

    // Check if the formatted value is rendered
    expect(screen.getByText('1,234')).toBeInTheDocument();

    // Check if the icon is rendered
    expect(screen.getByText('💼')).toBeInTheDocument();
  });

  it('renders string value correctly', () => {
    const props = {
      title: 'Recent Jobs',
      value: '50+',
      icon: '✨',
      color: 'green' as const,
    };

    render(<StatsCard {...props} />);

    // Check if the string value is rendered
    expect(screen.getByText('50+')).toBeInTheDocument();
  });
});
