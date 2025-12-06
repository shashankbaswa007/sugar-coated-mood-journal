#!/usr/bin/env node
/**
 * Simple mock aggregation endpoint for local development.
 * Start with `npm run start:api` and point `REACT_APP_ALL_USERS_API_URL`
 * at `http://localhost:4001/api/all-users/moods` in your `.env` during development.
 */

const express = require('express');
const app = express();
// simple CORS middleware (avoid extra dependency for local mock)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

// Example realistic-looking aggregated mood counts for demo purposes.
// This is a mock; replace with your real aggregation service in production.
const aggregated = {
  happy: 124,
  sad: 37,
  stressed: 54,
  energetic: 89,
  sleepy: 42,
  excited: 61,
  grateful: 23,
  hopeful: 18,
  peaceful: 29,
  anxious: 33,
  nostalgic: 12,
  inspired: 20,
};

app.get('/api/all-users/moods', (req, res) => {
  res.json(aggregated);
});

const port = process.env.PORT || 4001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Mock All-Users API listening at http://localhost:${port}/api/all-users/moods`);
});

module.exports = app;
