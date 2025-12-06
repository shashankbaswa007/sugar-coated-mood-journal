import React, { useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Avatar,
  Chip,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import { analyzeMood, moodSpotifyPlaylists, getInitialSuggestions, getRefreshSuggestions } from '../services/geminiService';
import { Mood, MoodAnalysis } from '../types';
import { MoodContext } from '../context/MoodContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { getMoodColor } from '../utils/moodUtils';
import HistoryList from './HistoryList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// Animation variants for drop letters
const dropLetterVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

// Emotion options with emojis
const emotions = [
  { value: 'happy', label: 'Happy 😊', color: '#FFD700', emoji: '😊', description: "You're feeling like a kid in a candy store! 🍬" },
  { value: 'sad', label: 'Sad 😢', color: '#4169E1', emoji: '😢', description: "Even the sweetest treats can't fix everything, but they help! 🍫" },
  { value: 'stressed', label: 'Stressed 😰', color: '#FF69B4', emoji: '😰', description: "When life gives you stress, eat chocolate! 🍪" },
  { value: 'energetic', label: 'Energetic ⚡', color: '#32CD32', emoji: '⚡', description: "You're buzzing like a bee on sugar! 🐝" },
  { value: 'sleepy', label: 'Sleepy 😴', color: '#9370DB', emoji: '😴', description: "Time for a sugar rush to wake you up! ☕" }
];

type Analysis = MoodAnalysis;

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Journal: React.FC = () => {
  const { currentMood, setCurrentMood } = useContext(MoodContext);
  const theme = useTheme();
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [mood, setMood] = useState<Mood | ''>(currentMood || '');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [animatedResponse, setAnimatedResponse] = useState<string[]>([]);
  const [history, setHistory] = useLocalStorage('scmj.journalHistory', [] as any[]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update animated response when analysis changes
  React.useEffect(() => {
    if (analysis?.response) {
      setAnimatedResponse(analysis.response.split(''));
    }
  }, [analysis]);

  const handleSubmit = async () => {
    if (!journalEntry.trim() || !mood) return;
    
    setIsAnalyzing(true);
    try {
      // Step 1: IMMEDIATELY show hard-coded suggestions (non-blocking)
      const initialResult = getInitialSuggestions(mood);
      console.log("Initial hard-coded suggestions:", initialResult);
      setAnalysis(initialResult);
      
      // Step 2: Save initial entry to history with hard-coded suggestions
      try {
        const now = Date.now();
        const newEntry = {
          id: now,
          mood,
          journalEntry,
          analysis: initialResult,
          createdAt: now,
          pending: false
        } as any;

        // If there's a pending latest entry with same mood, update it
        if (history && history.length > 0 && (history[0] as any).pending && (history[0] as any).mood === mood) {
          const updatedLatest = { ...history[0], journalEntry, analysis: initialResult, pending: false, createdAt: (history[0] as any).createdAt || now };
          const updated = [updatedLatest, ...history.slice(1)];
          setHistory(pruneHistory(updated));
        } else {
          setHistory(pruneHistory([newEntry, ...history]));
        }
      } catch (e) {
        console.warn('Could not persist history', e);
      }
      
      setIsAnalyzing(false);
      
      // Step 3: In BACKGROUND, call Grok to get enriched suggestions (non-blocking)
      // Don't await - let it run in background and update when ready
      analyzeMood(journalEntry, mood)
        .then((enrichedResult) => {
          console.log("Enriched Grok suggestions received:", enrichedResult);
          // Replace with Grok-enriched suggestions
          setAnalysis(enrichedResult);
          
          // Update history with enriched suggestions
          setHistory((currentHistory) => {
            if (!currentHistory || currentHistory.length === 0) return currentHistory;
            const latest = { ...currentHistory[0] };
            latest.analysis = { ...(latest.analysis || {}), ...enrichedResult };
            return pruneHistory([latest, ...currentHistory.slice(1)]);
          });
        })
        .catch((error) => {
          console.error('Background Grok enrichment failed, keeping hard-coded suggestions:', error);
          // Keep the hard-coded suggestions if Grok fails
        });
      
    } catch (error) {
      console.error('Error analyzing mood:', error);
      setErrorMessage('Could not analyze your journal. Please try again.');
      setIsAnalyzing(false);
    }
  };

  // Prune history to last 30 days
  const pruneHistory = (hist: any[]) => {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return hist.filter((h) => {
      const created = h && h.createdAt ? h.createdAt : h.id ? h.id : now;
      return now - created <= THIRTY_DAYS;
    });
  };

  const handleRefreshSuggestions = async () => {
    if (!mood || !journalEntry || !analysis) {
      console.warn('No mood, journal entry, or analysis available to refresh');
      return;
    }
    
    setIsRefreshing(true);
    console.log('Refreshing suggestions... Calling Gemini API for fresh suggestions');
    
    try {
      // Call Gemini API to get fresh AI-generated suggestions (no cache)
      const newAnalysis = await getRefreshSuggestions(journalEntry, mood);
      console.log('Received new Gemini-generated suggestions:', newAnalysis.foodSuggestions);

      const updatedAnalysis: Analysis = {
        response: analysis.response,
        foodSuggestions: newAnalysis.foodSuggestions,
        quote: newAnalysis.quote || analysis.quote,
        poetry: analysis.poetry,
        likedSuggestions: analysis.likedSuggestions || []
      };

      console.log('Setting new analysis with suggestions:', updatedAnalysis.foodSuggestions);
      setAnalysis(updatedAnalysis);
      
      // Update history with new suggestions
      setHistory((currentHistory) => {
        if (!currentHistory || currentHistory.length === 0) return currentHistory;
        const latest = { ...currentHistory[0] };
        latest.analysis = { ...(latest.analysis || {}), foodSuggestions: newAnalysis.foodSuggestions };
        return pruneHistory([latest, ...currentHistory.slice(1)]);
      });
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
      setErrorMessage('Could not refresh suggestions. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLike = (suggestion: any) => {
    const key = suggestion.name;
    setLiked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });

    setAnalysis((prev) => {
      if (!prev) return prev;
      const likedArr = prev.likedSuggestions ? [...prev.likedSuggestions] : [];
      const exists = likedArr.find((s) => s.name === suggestion.name);
      let newLiked: typeof likedArr;
      if (exists) {
        newLiked = likedArr.filter((s) => s.name !== suggestion.name);
      } else {
        newLiked = [...likedArr, suggestion];
      }
      // update persisted history latest entry if exists
      setHistory((hist) => {
        if (!hist || hist.length === 0) return hist;
        const latest = { ...hist[0] };
        latest.analysis = { ...(latest.analysis || {}), likedSuggestions: newLiked };
        return pruneHistory([latest, ...hist.slice(1)]);
      });

      return { ...prev, likedSuggestions: newLiked } as Analysis;
    });
  };

  const handleRetry = async () => {
    setErrorMessage(null);
    await handleSubmit();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <Paper elevation={3} sx={{ 
            p: 4, 
            borderRadius: 4, 
            backgroundColor: theme.palette.background.paper,
            backdropFilter: 'blur(20px)',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(26, 26, 26, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0, 0, 0, 0.6)'
              : '0 12px 40px rgba(0, 0, 0, 0.1)',
          }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ 
            fontFamily: "'Comic Sans MS', cursive",
            background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: theme.palette.mode === 'dark' 
              ? '0 0 30px rgba(255, 105, 180, 0.3)' 
              : '0 0 20px rgba(255, 105, 180, 0.2)',
            mb: 4,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          }}>
            🍬 Sugar-Coated Mood Journal 🍭
          </Typography>

          {!mood && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ 
              fontFamily: "'Comic Sans MS', cursive",
              color: '#FF1493',
              mb: 2
            }}>
              Yo, How's Your Sweet Tooth Vibing Today? 🍪
            </Typography>
            <Grid container spacing={2}>
              {emotions.map((emotion) => (
                <Grid item xs={6} sm={4} key={emotion.value}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Paper
                      elevation={mood === emotion.value ? 8 : 2}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: mood === emotion.value 
                          ? `linear-gradient(135deg, ${emotion.color} 0%, ${emotion.color}cc 100%)`
                          : theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'white',
                        border: `3px solid ${emotion.color}`,
                        borderRadius: 4,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, ${emotion.color}22 0%, ${emotion.color}00 100%)`,
                          opacity: mood === emotion.value ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 12px 24px ${emotion.color}44`,
                          borderColor: emotion.color,
                          '&::before': {
                            opacity: 1,
                          },
                        },
                        '&:active': {
                          transform: 'translateY(-4px) scale(0.98)',
                        },
                      }}
                      onClick={() => {
                        setMood(emotion.value as Mood);
                        setCurrentMood(emotion.value as Mood);
                        // record a pending mood click so the dashboard updates immediately
                        try {
                          const now = Date.now();
                          const last = history && history.length > 0 ? history[0] : null;
                          // avoid rapid duplicates
                          if (last && (last as any).mood === emotion.value && ((now - ((last as any).createdAt || (last as any).id || 0)) < 10000)) {
                            // recent same mood click, don't duplicate
                          } else {
                            const pending = { id: now, mood: emotion.value, journalEntry: '', analysis: null, createdAt: now, pending: true };
                            setHistory(pruneHistory([pending, ...history]));
                          }
                        } catch (err) {
                          console.warn('Could not record mood click', err);
                        }
                      }}
                      role="button"
                      aria-label={`Select mood ${emotion.label}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setMood(emotion.value as Mood);
                          setCurrentMood(emotion.value as Mood);
                          e.preventDefault();
                        }
                      }}
                    >
                      <Typography variant="h6" sx={{ 
                        fontFamily: "'Comic Sans MS', cursive",
                        color: mood === emotion.value ? 'white' : emotion.color
                      }}>
                        {emotion.emoji}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontFamily: "'Comic Sans MS', cursive",
                        color: mood === emotion.value ? 'white' : 'text.primary'
                      }}>
                        {emotion.label.split(' ')[0]}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        fontFamily: "'Comic Sans MS', cursive",
                        color: mood === emotion.value ? 'white' : 'text.secondary',
                        display: 'block',
                        mt: 1
                      }}>
                        {emotion.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Spill Your Sweet Tea Here 🍯"
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 4px 20px rgba(255, 105, 180, 0.15)',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
                '&.Mui-focused': {
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 4px 24px rgba(255, 105, 180, 0.25)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
                '& .MuiOutlinedInput-input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                }
              },
              '& .MuiInputLabel-root': {
                fontFamily: "'Comic Sans MS', cursive",
                color: '#FF69B4',
                fontWeight: 600,
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!journalEntry.trim() || !mood || isAnalyzing}
                sx={{
                  background: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontFamily: "'Comic Sans MS', cursive",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(255, 105, 180, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(255, 105, 180, 0.5)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Let\'s See What The Sugar Gods Say 🍬'}
              </Button>
            </motion.div>
          </Box>

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper elevation={3} sx={{ 
                p: 4, 
                borderRadius: 4, 
                backgroundColor: theme.palette.background.paper, 
                color: theme.palette.text.primary,
                backdropFilter: 'blur(20px)',
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(26, 26, 26, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 105, 180, 0.2)' : 'rgba(255, 105, 180, 0.1)'}`,
              }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: "'Comic Sans MS', cursive",
                  color: '#FF1493',
                  mb: 3
                }}>
                  Your Mood Analysis (No Cap) 🎭
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 3,
                  fontFamily: "'Comic Sans MS', cursive",
                  letterSpacing: '0.5px',
                  wordSpacing: '2px'
                }}>
                  {animatedResponse.map((char, index) => (
                    <motion.span
                      key={index}
                      initial="hidden"
                      animate="visible"
                      variants={dropLetterVariants}
                      custom={index}
                      style={{ 
                        display: 'inline-block',
                        marginRight: char === ' ' ? '0.5em' : '0'
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </Typography>

                {/* Accessibility: announce the analysis response to screen readers */}
                <Box sx={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden' }} aria-live="polite">
                  {analysis?.response}
                </Box>

                {/* Analysis details removed per user request */}

                {analysis?.poetry && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontFamily: "'Comic Sans MS', cursive",
                      color: '#FF1493',
                      mb: 2
                    }}>
                      Your Daily Dose of Sugar Poetry (No Cap) 🍯
                    </Typography>
                    <Paper elevation={2} sx={{ p: 3, backgroundColor: theme.palette.background.paper, borderRadius: 3, color: theme.palette.text.primary }}>
                      <Typography variant="body1" sx={{ 
                        fontFamily: "'Comic Sans MS', cursive",
                        fontStyle: 'italic',
                        whiteSpace: 'pre-line',
                        textAlign: 'center'
                      }}>
                        {analysis.poetry}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {/* Mood memes removed by request */}

                {/* History display (simple list) */}
                {history && history.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                      <HistoryList
                        history={history}
                        onDelete={(id) => setHistory(history.filter(h=>h.id !== id))}
                        onClear={() => setHistory([])}
                      />
                  </Box>
                )}

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ 
                      fontFamily: "'Comic Sans MS', cursive",
                      color: theme.palette.primary.main
                    }}>
                      🍽️ Food Suggestions (Dank Edition)
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={handleRefreshSuggestions}
                      disabled={isAnalyzing || isRefreshing}
                      sx={{
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        borderWidth: 2,
                        fontWeight: 700,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 105, 180, 0.15)' 
                            : 'rgba(255, 105, 180, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(255, 105, 180, 0.3)',
                        }
                      }}
                    >
                      {isRefreshing ? 'Loading...' : 'Hit Me With Another One 🔄'}
                    </Button>
                  </Box>
                  {(analysis.foodSuggestions || []).slice(0, 3).map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                    <Paper
                      elevation={2}
                      sx={{ 
                        p: 3, 
                        mb: 2, 
                        borderRadius: 3, 
                        backgroundColor: theme.palette.background.paper, 
                        color: theme.palette.text.primary,
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 105, 180, 0.2)' : 'rgba(255, 105, 180, 0.1)'}`,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '4px',
                          height: '100%',
                          background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover': {
                          transform: 'translateX(8px)',
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 12px 32px rgba(255, 105, 180, 0.2)'
                            : '0 12px 32px rgba(255, 105, 180, 0.15)',
                          borderColor: theme.palette.primary.main,
                          '&::before': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <Typography variant="h6" sx={{ 
                        fontFamily: "'Comic Sans MS', cursive",
                        color: theme.palette.primary.main,
                        mb: 1
                      }}>
                        {suggestion.name}
                        <IconButton
                          aria-label={`like-${suggestion.name}`}
                          onClick={() => handleLike(suggestion)}
                          size="small"
                          sx={{ ml: 1, color: liked[suggestion.name] ? '#e91e63' : undefined }}
                        >
                          {liked[suggestion.name] ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, fontFamily: "'Comic Sans MS', cursive" }}>
                        {suggestion.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, fontFamily: "'Comic Sans MS', cursive" }}>
                        <strong>Recipe:</strong> {suggestion.recipe}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          href={suggestion.orderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            fontFamily: "'Comic Sans MS', cursive",
                            fontWeight: 700,
                            boxShadow: `0 6px 20px ${theme.palette.primary.main}44`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 24px ${theme.palette.primary.main}66`,
                            }
                          }}
                        >
                          Order Now 🛵
                        </Button>
                        <Button
                          variant="outlined"
                          href={suggestion.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderRadius: 3,
                            borderColor: '#FF0000',
                            color: '#FF0000',
                            borderWidth: 2,
                            fontFamily: "'Comic Sans MS', cursive",
                            fontWeight: 700,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              borderWidth: 2,
                              borderColor: '#FF0000',
                              background: 'rgba(255, 0, 0, 0.1)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 20px rgba(255, 0, 0, 0.3)',
                            }
                          }}
                        >
                          Watch Recipe 🎥
                        </Button>
                        <Button
                          variant="outlined"
                          href={moodSpotifyPlaylists[mood] || "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderRadius: 3,
                            borderColor: '#1DB954',
                            color: '#1DB954',
                            borderWidth: 2,
                            fontFamily: "'Comic Sans MS', cursive",
                            fontWeight: 700,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              borderWidth: 2,
                              borderColor: '#1DB954',
                              background: 'rgba(29, 185, 84, 0.1)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 20px rgba(29, 185, 84, 0.3)',
                            }
                          }}
                        >
                          Start Vibin 🎵
                        </Button>
                      </Box>
                    </Paper>
                    </motion.div>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          )}
        </Paper>
      </motion.div>
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage(null)}>
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }} action={<Button color="inherit" size="small" onClick={handleRetry}>Retry</Button>}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Journal; 