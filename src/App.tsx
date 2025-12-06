import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './components/Home';
import Journal from './components/Journal';
import Dashboard from './components/Dashboard';
import { MoodProvider } from './context/MoodContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import useMediaQuery from '@mui/material/useMediaQuery';

// Sugar-themed background patterns
const backgroundPatterns = [
  '🍬', '🍭', '🍫', '🧁', '🍪', '🍩', '🍰', '🍡', '🍮', '🍯'
];

// Wrapper component to access location
interface AnimatedRoutesProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ isDarkMode, setIsDarkMode }) => {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('scmj.darkMode', false);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [backgroundItems, setBackgroundItems] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
  const isSmall = useMediaQuery('(max-width:600px)');

  // Create floating background items
  useEffect(() => {
    const items = Array.from({ length: isSmall ? 8 : 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      emoji: backgroundPatterns[Math.floor(Math.random() * backgroundPatterns.length)]
    }));
    setBackgroundItems(items);
  }, []);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#FF69B4',
        light: '#FFB6D9',
        dark: '#FF1493',
      },
      secondary: {
        main: '#FFD700',
        light: '#FFEB3B',
        dark: '#FFA000',
      },
      success: {
        main: '#32CD32',
        light: '#7FFF00',
      },
      info: {
        main: '#4169E1',
        light: '#87CEEB',
      },
      warning: {
        main: '#FF69B4',
      },
      background: {
        default: isDarkMode ? '#0a0a0a' : '#fafafa',
        paper: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#1a1a1a',
        secondary: isDarkMode ? '#b0b0b0' : '#666666',
      },
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            fontSize: '1rem',
            boxShadow: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(255, 105, 180, 0.3)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              backgroundColor: 'rgba(255, 105, 180, 0.08)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
              : '0 8px 32px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)',
          },
          elevation1: {
            boxShadow: isDarkMode 
              ? '0 4px 16px rgba(0, 0, 0, 0.4)' 
              : '0 4px 16px rgba(0, 0, 0, 0.06)',
          },
          elevation2: {
            boxShadow: isDarkMode 
              ? '0 8px 24px rgba(0, 0, 0, 0.5)' 
              : '0 8px 24px rgba(0, 0, 0, 0.08)',
          },
          elevation3: {
            boxShadow: isDarkMode 
              ? '0 12px 32px rgba(0, 0, 0, 0.6)' 
              : '0 12px 32px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            overflow: 'hidden',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(255, 105, 180, 0.15)',
              },
              '&.Mui-focused': {
                boxShadow: '0 4px 16px rgba(255, 105, 180, 0.25)',
              },
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #2d1b69 50%, #1a1a2e 75%, #0a0a0a 100%)' 
            : 'linear-gradient(135deg, #ffeef8 0%, #fff0f5 25%, #ffe5f0 50%, #fff5ee 75%, #ffeef8 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      >
        {/* Floating background items */}
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
          {backgroundItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.3, 1],
                x: [item.x, item.x + 15, item.x],
                y: [item.y, item.y - 15, item.y],
                rotate: [0, 360, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
              style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: '1.5rem',
                zIndex: 0,
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </Box>

              <MoodProvider>
          <Router>
            <AnimatedRoutes isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </Router>
              </MoodProvider>
      </Box>
    </ThemeProvider>
  );
};

export default App; 