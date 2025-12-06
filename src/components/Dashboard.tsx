import React from 'react';
import { Box, Paper, Typography, Grid, useTheme } from '@mui/material';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Mood configuration with colors and emojis
const moodConfig = {
  happy: { label: 'Happy', emoji: '😊', color: '#FFD700' },
  sad: { label: 'Sad', emoji: '😢', color: '#4169E1' },
  stressed: { label: 'Stressed', emoji: '😩', color: '#FF69B4' },
  energetic: { label: 'Energetic', emoji: '⚡', color: '#32CD32' },
  sleepy: { label: 'Sleepy', emoji: '😴', color: '#9370DB' }
};

const moodsList = Object.keys(moodConfig);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [history] = useLocalStorage('scmj.journalHistory', [] as any[]);

  // Calculate mood counts for the last 30 days
  const personalCounts = (history || []).reduce((acc: Record<string, number>, h: any) => {
    const created = h && h.createdAt ? h.createdAt : h.id ? h.id : 0;
    if (Date.now() - created <= 30 * 24 * 60 * 60 * 1000) {
      acc[h.mood] = (acc[h.mood] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate mood timeline (chronological entries over time)
  const timelineData = React.useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentEntries = (history || [])
      .filter((h: any) => {
        const created = h && h.createdAt ? h.createdAt : h.id ? h.id : 0;
        return created >= thirtyDaysAgo;
      })
      .sort((a: any, b: any) => {
        const aTime = a.createdAt || a.id || 0;
        const bTime = b.createdAt || b.id || 0;
        return aTime - bTime; // Sort chronologically (oldest first)
      });

    // Create timeline points with dates
    return recentEntries.map((h: any, index: number) => {
      const timestamp = h.createdAt || h.id || 0;
      const date = new Date(timestamp);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      // Map mood to numeric value for chart (1-5 scale)
      const moodValues: Record<string, number> = {
        sad: 1,
        stressed: 2,
        sleepy: 3,
        happy: 4,
        energetic: 5
      };

      return {
        date: dateStr,
        timestamp,
        mood: h.mood,
        moodValue: moodValues[h.mood] || 3,
        moodLabel: moodConfig[h.mood as keyof typeof moodConfig]?.label || h.mood,
        moodColor: moodConfig[h.mood as keyof typeof moodConfig]?.color || '#999'
      };
    });
  }, [history]);

  // Prepare data for bar chart
  const barChartData = moodsList.map((mood) => ({
    mood: moodConfig[mood as keyof typeof moodConfig].emoji + ' ' + moodConfig[mood as keyof typeof moodConfig].label,
    count: personalCounts[mood] || 0
  }));

  // Prepare data for pie chart
  const pieChartData = moodsList
    .map((mood) => ({
      name: moodConfig[mood as keyof typeof moodConfig].label,
      value: personalCounts[mood] || 0,
      emoji: moodConfig[mood as keyof typeof moodConfig].emoji
    }))
    .filter(d => d.value > 0);

  // Prepare data for radar chart
  const radarData = moodsList.map((mood) => ({
    mood: moodConfig[mood as keyof typeof moodConfig].label,
    count: personalCounts[mood] || 0,
    fullMark: Math.max(...Object.values(personalCounts), 5)
  }));

  const totalEntries = Object.values(personalCounts).reduce((a, b) => a + b, 0);
  const mostFrequentMood = moodsList.reduce((a, b) => 
    (personalCounts[a] || 0) > (personalCounts[b] || 0) ? a : b
  );

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <Typography 
        variant="h3" 
        sx={{ 
          mb: 4, 
          fontFamily: "'Comic Sans MS', cursive",
          background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          fontWeight: 800,
        }}
      >
        🎭 Mood Dashboard
      </Typography>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)',
            borderRadius: 4,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 24px rgba(255, 105, 180, 0.3)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 16px 40px rgba(255, 105, 180, 0.5)',
            },
          }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', fontFamily: "'Comic Sans MS', cursive" }}>{totalEntries}</Typography>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>Total Entries (30 days)</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #32CD32 0%, #4169E1 100%)',
            borderRadius: 4,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 24px rgba(50, 205, 50, 0.3)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 16px 40px rgba(50, 205, 50, 0.5)',
            },
          }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', fontFamily: "'Comic Sans MS', cursive" }}>
              {moodConfig[mostFrequentMood as keyof typeof moodConfig]?.emoji || '😊'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
              Most Frequent: {moodConfig[mostFrequentMood as keyof typeof moodConfig]?.label || 'None'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #9370DB 0%, #FF69B4 100%)',
            borderRadius: 4,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 24px rgba(147, 112, 219, 0.3)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 16px 40px rgba(147, 112, 219, 0.5)',
            },
          }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', fontFamily: "'Comic Sans MS', cursive" }}>
              {pieChartData.length}
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>Different Moods</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Bar Chart - Mood Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: '100%',
            borderRadius: 4,
            background: theme.palette.mode === 'dark' 
              ? 'rgba(26, 26, 26, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 32px rgba(255, 105, 180, 0.2)',
            }
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 'bold', 
              fontFamily: "'Comic Sans MS', cursive",
              background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              📊 Mood Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <XAxis 
                  dataKey="mood" 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '12px', fontFamily: "'Comic Sans MS', cursive" }}
                />
                <YAxis 
                  allowDecimals={false}
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: theme.palette.mode === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    fontFamily: "'Comic Sans MS', cursive"
                  }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(moodConfig)[index].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart - Mood Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: '100%',
            borderRadius: 4,
            background: theme.palette.mode === 'dark' 
              ? 'rgba(26, 26, 26, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 32px rgba(255, 215, 0, 0.2)',
            }
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 'bold', 
              fontFamily: "'Comic Sans MS', cursive",
              background: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              🥧 Mood Breakdown
            </Typography>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={moodConfig[moodsList[index] as keyof typeof moodConfig]?.color || '#999'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: theme.palette.mode === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                      fontFamily: "'Comic Sans MS', cursive"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  No mood data available. Start journaling! 📝
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Mood Timeline - Chronological View */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: '100%',
            borderRadius: 4,
            background: theme.palette.mode === 'dark' 
              ? 'rgba(26, 26, 26, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 32px rgba(65, 105, 225, 0.2)',
            }
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 'bold', 
              fontFamily: "'Comic Sans MS', cursive",
              background: 'linear-gradient(135deg, #4169E1 0%, #9370DB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              📅 Mood Timeline
            </Typography>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <XAxis 
                    dataKey="date" 
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '12px', fontFamily: "'Comic Sans MS', cursive" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={[0, 6]}
                    ticks={[1, 2, 3, 4, 5]}
                    stroke={theme.palette.text.secondary}
                    tickFormatter={(value) => {
                      const labels: Record<number, string> = {
                        1: '😢',
                        2: '😩',
                        3: '😴',
                        4: '😊',
                        5: '⚡'
                      };
                      return labels[value] || '';
                    }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Paper sx={{ 
                            p: 1.5, 
                            border: `2px solid ${data.moodColor}`,
                            borderRadius: '12px',
                            boxShadow: `0 4px 16px ${data.moodColor}44`,
                            background: theme.palette.mode === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: data.moodColor, fontFamily: "'Comic Sans MS', cursive" }}>
                              {data.moodLabel}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {data.date}
                            </Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moodValue" 
                    stroke="#FF69B4"
                    strokeWidth={4}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill={payload.moodColor}
                          stroke="#fff"
                          strokeWidth={3}
                          filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))"
                        />
                      );
                    }}
                    activeDot={{ r: 10, stroke: '#FFD700', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  No mood timeline available. Start journaling! 📝
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Radar Chart - Mood Balance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: '100%',
            borderRadius: 4,
            background: theme.palette.mode === 'dark' 
              ? 'rgba(26, 26, 26, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 32px rgba(50, 205, 50, 0.2)',
            }
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 'bold', 
              fontFamily: "'Comic Sans MS', cursive",
              background: 'linear-gradient(135deg, #32CD32 0%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              🎯 Mood Balance Radar
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'} />
                <PolarAngleAxis 
                  dataKey="mood" 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '12px', fontFamily: "'Comic Sans MS', cursive" }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 'auto']}
                  stroke={theme.palette.text.secondary}
                />
                <Radar 
                  name="Mood Frequency" 
                  dataKey="count" 
                  stroke="#FF69B4" 
                  fill="#FF69B4" 
                  fillOpacity={0.6}
                  strokeWidth={3}
                />
                <Tooltip 
                  contentStyle={{
                    background: theme.palette.mode === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    fontFamily: "'Comic Sans MS', cursive"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
