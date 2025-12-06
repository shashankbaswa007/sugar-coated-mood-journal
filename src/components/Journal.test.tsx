import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Journal from './Journal';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { MoodProvider } from '../context/MoodContext';
import * as geminiService from '../services/geminiService';

const theme = createTheme();

jest.mock('../services/geminiService');

describe('Journal interactions', () => {
  beforeEach(() => {
    // Ensure localStorage is clean between tests
    localStorage.clear();
    (geminiService.analyzeMood as jest.Mock).mockResolvedValue({ response: 'Test response', foodSuggestions: [], quote: 'Test Quote', poetry: '' });
    (geminiService.generateMeme as jest.Mock).mockResolvedValue({ imageUrl: '', caption: '', description: '' });
    (geminiService.getInitialSuggestions as jest.Mock).mockReturnValue({ response: 'Initial response', foodSuggestions: [{ name: 'Test Food', description: 'Test desc', recipe: 'Test recipe', orderLink: '#', youtubeLink: '#' }], quote: 'Initial Quote', poetry: 'Initial poetry' });
    // Render a fresh Journal component for each test
    const theme = createTheme();
    render(
      <ThemeProvider theme={theme}>
        <MoodProvider>
          <MemoryRouter>
            <Journal />
          </MemoryRouter>
        </MoodProvider>
      </ThemeProvider>
    );
  });

  it('submits an entry and adds to history', async () => {
    const textfield = screen.getByLabelText(/Spill Your Sweet Tea Here/i);
    fireEvent.change(textfield, { target: { value: 'I am great' } });
    // Select mood
    const happy = screen.getAllByText(/Happy/i)[0];
    fireEvent.click(happy);
    // Submit
    const submitButton = screen.getByRole('button', { name: /Let's See What The Sugar Gods Say/i });
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText(/Your Mood Analysis/i)).toBeInTheDocument());
    // History should be visible
    expect(screen.getByText(/Your Past Entries/i)).toBeInTheDocument();
  });

  it('deletes and clears history entries', async () => {
    // Create an entry first
    const textfield = screen.getByLabelText(/Spill Your Sweet Tea Here/i);
    fireEvent.change(textfield, { target: { value: 'I am ok' } });
    const happy = screen.getAllByText(/Happy/i)[0];
    fireEvent.click(happy);
    const submitButton = screen.getByRole('button', { name: /Let's See What The Sugar Gods Say/i });
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText(/Your Past Entries/i)).toBeInTheDocument());
    // Click Clear All button to remove history
    const clearButton = await screen.findByRole('button', { name: /Clear All/i });
    fireEvent.click(clearButton);
    await waitFor(() => expect(screen.queryByText(/Your Past Entries/i)).not.toBeInTheDocument());
  });

  it('exports CSV', async () => {
    // Mock createObjectURL
    const createObjectURL = URL.createObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob://test');
    const originalRevoke = (URL as any).revokeObjectURL;
    (URL as any).revokeObjectURL = jest.fn();

    const textfield = screen.getByLabelText(/Spill Your Sweet Tea Here/i);
    fireEvent.change(textfield, { target: { value: 'Export me' } });
    const happy = screen.getAllByText(/Happy/i)[0];
    fireEvent.click(happy);
    const submitButton = screen.getByRole('button', { name: /Let's See What The Sugar Gods Say/i });
    fireEvent.click(submitButton);
    await screen.findByText(/Your Past Entries/i);

    // Mock anchor click only when needed
    const clickMock = jest.fn();
    const originalCreateElement = document.createElement;
    document.createElement = ((tagName: any) => {
      if (tagName === 'a') {
        return ({ href: '', download: '', click: clickMock, setAttribute: jest.fn(), style: {} } as any);
      }
      return originalCreateElement.call(document, tagName);
    }) as any;

    const exportButton = screen.getByRole('button', { name: /Export CSV/i });
    fireEvent.click(exportButton);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    
    // Cleanup
    document.createElement = originalCreateElement;
    (URL as any).revokeObjectURL = originalRevoke;
    URL.createObjectURL = createObjectURL;
  });
});
