import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { MoodProvider } from '../context/MoodContext';

const theme = createTheme();

describe('Home component', () => {
  it('renders moods and user can select one', () => {
    render(
      <ThemeProvider theme={theme}>
        <MoodProvider>
          <MemoryRouter>
            <Home isDarkMode={false} setIsDarkMode={() => {}} />
          </MemoryRouter>
        </MoodProvider>
      </ThemeProvider>
    );

    const happyCard = screen.getByText(/Happy/i);
    expect(happyCard).toBeInTheDocument();
    fireEvent.click(happyCard);
    // After click, recommended treats should appear
    const recommendedTitle = screen.getByText(/Recommended Treats/i);
    expect(recommendedTitle).toBeInTheDocument();
  });
});
