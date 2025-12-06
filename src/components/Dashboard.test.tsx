import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

describe('Dashboard', () => {
  it('renders the Mood Dashboard title', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
    expect(screen.getByText(/Mood Dashboard/i)).toBeInTheDocument();
  });

  it('displays mood distribution chart', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
    expect(screen.getByText(/Mood Distribution/i)).toBeInTheDocument();
  });

  it('displays mood breakdown pie chart', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
    expect(screen.getByText(/Mood Breakdown/i)).toBeInTheDocument();
  });

  it('displays weekly mood trends', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
    expect(screen.getByText(/Mood Timeline/i)).toBeInTheDocument();
  });

  it('displays mood balance radar', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
    expect(screen.getByText(/Mood Balance Radar/i)).toBeInTheDocument();
  });

  it('shows total entries stat', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
    expect(screen.getByText(/Total Entries/i)).toBeInTheDocument();
  });
});
