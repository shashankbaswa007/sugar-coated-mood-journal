import React, { useContext } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  IconButton,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { MoodContext } from '../context/MoodContext';
import { Mood } from '../types';
import { useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import CakeIcon from '@mui/icons-material/Cake';
import IcecreamIcon from '@mui/icons-material/Icecream';
import CookieIcon from '@mui/icons-material/Cookie';

interface HomeProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

interface MoodItem {
  id: Mood;
  icon: React.ReactNode;
  label: string;
  color: string;
  description: string;
}

const moods: MoodItem[] = [
  { 
    id: 'happy', 
    icon: <EmojiEmotionsIcon />, 
    label: 'Happy 😊', 
    color: '#FFD700',
    description: "You're feeling like a kid in a candy store! 🍬"
  },
  { 
    id: 'sad', 
    icon: <SentimentVeryDissatisfiedIcon />, 
    label: 'Sad 😢', 
    color: '#4169E1',
    description: "Even the sweetest treats can't fix everything, but they help! 🍫"
  },
  { 
    id: 'stressed', 
    icon: <FavoriteIcon />, 
    label: 'Stressed 😩', 
    color: '#FF69B4',
    description: "When life gives you stress, eat chocolate! 🍪"
  },
  { 
    id: 'energetic', 
    icon: <BatteryChargingFullIcon />, 
    label: 'Energetic ⚡', 
    color: '#32CD32',
    description: "You're buzzing like a bee on sugar! 🐝"
  },
  { 
    id: 'sleepy', 
    icon: <NightlightRoundIcon />, 
    label: 'Sleepy 😴', 
    color: '#9370DB',
    description: "Time for a sugar rush to wake you up! ☕"
  },
];

const chocolateRecommendations: Record<string, string[]> = {
  happy: ['Double Fudge Brownie 🍫', 'Rainbow Sprinkle Cupcake 🧁', 'Cookie Dough Ice Cream 🍪'],
  sad: ['Hot Chocolate with Marshmallows ☕', 'Chocolate Chip Cookies 🍪', 'Banana Split 🍌'],
  stressed: ['Dark Chocolate Truffles 🍫', 'Chocolate Lava Cake 🍰', 'Mint Chocolate Chip Ice Cream 🍦'],
  energetic: ['Energy Bar with Chocolate 🍫', 'Chocolate Protein Shake 🥤', 'Trail Mix with Chocolate 🥜'],
  sleepy: ['Chocolate Milk 🥛', 'Chocolate Covered Coffee Beans ☕', 'Chocolate Granola Bar 🌰'],
};

const dankQuotes: Record<string, string[]> = {
  happy: [
    "You're so happy, even your coffee is smiling! ☕😊",
    "Your joy is so contagious, even my dentist is happy! 🦷",
    "You're the human version of a double rainbow! 🌈🌈",
    "Your happiness is so bright, I need sunglasses! 🕶️",
    "You're spreading joy like confetti at a birthday party! 🎉"
  ],
  sad: [
    "Even the saddest cookie has chocolate chips! 🍪",
    "Your tears are just emotional sprinkles! 💧✨",
    "This mood? Temporary. Your sweetness? Eternal! 🍯",
    "Even the sun sets to rise again, just like your mood! 🌅",
    "You're not alone, even WiFi has weak moments! 📶"
  ],
  stressed: [
    "Stressed spelled backward is desserts. Just saying! 🍰",
    "If overthinking burned calories, you'd be a supermodel! 🧠",
    "You're not a Google Calendar—stop trying to schedule everything! 📅",
    "Even Batman needed a break. You? Deserve snacks and a nap! 🦇",
    "Plot twist: You're doing better than you think. Zoom out, champ! 🔍"
  ],
  energetic: [
    "You're serving Red Bull realness today! Where's your cape? 🦸‍♂️",
    "Is it coffee, chaos, or pure ambition? Either way—respect! ⚡",
    "You've got enough fire to roast everyone's negativity—nicely! 🔥",
    "If productivity had a face, it'd be yours right now! 💪",
    "You're like a playlist that just dropped banger after banger! 🎧"
  ],
  sleepy: [
    "Running on vibes and vibes only! 😴",
    "Your motivation is buffering... please wait! ⏳",
    "If yawns burned calories, you'd be shredded! 😪",
    "Sleep called. It's wondering why you ghosted! 😴",
    "You're not lazy. You're just energy-efficient! ♻️"
  ],
};

const Home: React.FC<HomeProps> = ({ isDarkMode, setIsDarkMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentMood, setCurrentMood } = useContext(MoodContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const getRandomQuote = (mood: string): string => {
    const quotes = dankQuotes[mood as keyof typeof dankQuotes] || dankQuotes.happy;
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        minHeight: '100vh', 
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <IconButton aria-label="Toggle dark mode" onClick={() => setIsDarkMode(!isDarkMode)} color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </motion.div>
        </Box>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontFamily: "'Comic Sans MS', cursive",
              color: theme.palette.primary.main,
              textAlign: 'center',
              mb: 4,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Sugar-Coated Mood Journal 🍫✨
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button variant="text" onClick={() => navigate('/dashboard')}>
              View Mood Dashboard 📊
            </Button>
          </Box>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
            How are you feeling today? 🤔
          </Typography>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%' }}
        >
          <Grid container spacing={3} justifyContent="center">
            {moods.map((mood) => (
              <Grid item xs={12} sm={6} md={4} key={mood.id}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: currentMood === mood.id ? 'translateY(-8px) scale(1.05)' : 'translateY(0)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.08)',
                        boxShadow: `0 20px 40px ${mood.color}66`,
                      },
                      bgcolor: currentMood === mood.id ? mood.color : 'background.paper',
                      color: currentMood === mood.id ? 'white' : 'text.primary',
                      border: `3px solid ${mood.color}`,
                      borderRadius: '24px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: currentMood === mood.id 
                        ? `linear-gradient(135deg, ${mood.color} 0%, ${mood.color}dd 100%)`
                        : theme.palette.mode === 'dark'
                        ? 'rgba(26, 26, 26, 0.8)'
                        : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: currentMood === mood.id 
                        ? `0 12px 32px ${mood.color}88`
                        : theme.palette.mode === 'dark'
                        ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                        : '0 8px 24px rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={() => setCurrentMood(mood.id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={currentMood === mood.id}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCurrentMood(mood.id);
                        e.preventDefault();
                      }
                    }}
                  >
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: currentMood === mood.id ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ fontSize: '3rem', mb: 1 }}>{mood.icon}</Box>
                    </motion.div>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{mood.label}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                      {mood.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {currentMood && (
          <motion.div
            key={currentMood}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Paper sx={{ 
              p: 3, 
              mt: 4, 
              maxWidth: 600, 
              width: '100%',
              borderRadius: '24px',
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%)' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 248, 248, 0.95) 100%)',
              border: `3px solid ${moods.find(m => m.id === currentMood)?.color || theme.palette.primary.main}`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 12px 40px ${moods.find(m => m.id === currentMood)?.color || theme.palette.primary.main}44`,
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recommended Treats for your mood: 🍪
              </Typography>
              <Box sx={{ mt: 2 }}>
                {chocolateRecommendations[currentMood].map((treat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <Box component="span" sx={{ mr: 1 }}>
                        {index === 0 ? <CakeIcon /> : index === 1 ? <IcecreamIcon /> : <CookieIcon />}
                      </Box>
                      {treat}
                    </Typography>
                  </motion.div>
                ))}
              </Box>
              
              <Box sx={{ mt: 3, mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '10px' }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "{getRandomQuote(currentMood)}"
                </Typography>
              </Box>
              
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ 
                    mt: 2,
                    width: '100%',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${moods.find(m => m.id === currentMood)?.color || theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 8px 24px ${moods.find(m => m.id === currentMood)?.color || theme.palette.primary.main}66`,
                    borderRadius: '16px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${moods.find(m => m.id === currentMood)?.color || theme.palette.primary.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${moods.find(m => m.id === currentMood)?.color || theme.palette.primary.main}88`,
                    },
                  }}
                  onClick={() => navigate('/journal')}
                >
                  Write in Journal 📝
                </Button>
              </motion.div>
            </Paper>
          </motion.div>
        )}
      </Box>
    </Container>
  );
};

export default Home; 