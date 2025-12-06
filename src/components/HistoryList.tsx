import React from 'react';
import { Box, Typography, Paper, Button, IconButton, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Mood } from '../types';

interface HistoryEntry {
  id: number;
  mood: Mood | string;
  journalEntry: string;
  analysis: any;
}

interface HistoryListProps {
  history: HistoryEntry[];
  onDelete: (id:number) => void;
  onClear: () => void;
}

const moodToValue: Record<string, number> = {
  happy: 5,
  excited: 5,
  grateful: 4,
  energetic: 4,
  hopeful: 3,
  peaceful: 3,
  nostalgic: 2,
  inspired: 3,
  sleepy: 1,
  sad: 1,
  stressed: 2,
  anxious: 1
};

const HistoryList: React.FC<HistoryListProps> = ({ history, onDelete, onClear }) => {
  const theme = useTheme();
  const exportCSV = () => {
    const header = ['id','mood','journalEntry','response','quote'];
    const rows = history.map(h => [h.id, h.mood, `"${h.journalEntry.replace(/"/g, '""')}"`, `"${h.analysis.response}"`, `"${h.analysis.quote || ''}"`]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scmj_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const data = history.map(h => ({ date: new Date(h.id).toLocaleDateString(), value: moodToValue[h.mood] || 3 }));

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">🧾 Your Past Entries</Typography>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }} startIcon={<FileDownloadIcon />} onClick={exportCSV}>Export CSV</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onClear}>Clear All</Button>
        </Box>
      </Box>

      {history && history.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2">Mood timeline</Typography>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis domain={[1,5]} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#FF69B4" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {history.map((h) => (
            <Paper key={h.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{h.mood} — {new Date(h.id).toLocaleString()}</Typography>
                <IconButton aria-label="delete" color="error" onClick={() => onDelete(h.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{h.journalEntry}</Typography>
              {h.analysis.likedSuggestions && h.analysis.likedSuggestions.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>💖 Liked Suggestions</Typography>
                  {h.analysis.likedSuggestions.map((suggestion: any, idx: number) => (
                    <Box key={idx} sx={{ ml: 2, mt: 2, p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5', borderRadius: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {suggestion.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {suggestion.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {suggestion.orderLink && (
                          <Button
                            variant="contained"
                            size="small"
                            href={suggestion.orderLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Order 🛵
                          </Button>
                        )}
                        {suggestion.youtubeLink && (
                          <Button
                            variant="outlined"
                            size="small"
                            href={suggestion.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Recipe 🎥
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          href={`https://open.spotify.com/search/${encodeURIComponent(suggestion.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Spotify 🎵
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HistoryList;
