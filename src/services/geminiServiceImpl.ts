import { MoodAnalysis, Meme, FoodSuggestion } from '../types';

// Feature flags
const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';
console.log('Gemini Service - USE_MOCK:', USE_MOCK, 'REACT_APP_USE_MOCK:', process.env.REACT_APP_USE_MOCK);

import moodResponses from '../data/moodResponses.json';
import moodPoetry from '../data/poetry.json';
import foodSuggestions from '../data/foodSuggestions.json';
import quotes from '../data/quotes.json';
import memes from '../data/memes.json';
import playlists from '../data/playlists.json';

export const moodSpotifyPlaylists: Record<string, string> = playlists as Record<string, string>;

async function callServerlessAnalyze(endpoint: string, journalEntry: string, mood: string) {
  console.log(`Calling ${endpoint} with mood: ${mood}`);
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: journalEntry, mood })
  });
  console.log(`Response status: ${resp.status}`);
  if (!resp.ok) {
    const errorText = await resp.text();
    console.error(`Serverless analyze failed: ${resp.status}`, errorText);
    throw new Error(`Serverless analyze failed: ${resp.status}`);
  }
  const data = await resp.json();
  console.log('Received data from API:', data);
  return data;
}

// Get immediate hard-coded suggestions (synchronous, no API call)
export const getInitialSuggestions = (mood: string): MoodAnalysis => {
  const allSuggestions: FoodSuggestion[] = (foodSuggestions as Record<string, FoodSuggestion[]>)[mood] || [];
  const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5);
  const selectedSuggestions = shuffled.slice(0, 3);
  // If we don't have enough suggestions for this mood, supplement from other moods
  if (selectedSuggestions.length < 3) {
    const otherPools = Object.keys(foodSuggestions).reduce((acc: FoodSuggestion[], k) => {
      if (k === mood) return acc;
      const arr = (foodSuggestions as Record<string, FoodSuggestion[]>)[k] || [];
      return acc.concat(arr);
    }, [] as FoodSuggestion[]);
    const shuffledOthers = [...otherPools].sort(() => Math.random() - 0.5);
    const existingNames = new Set(selectedSuggestions.map(s => s.name));
    for (const s of shuffledOthers) {
      if (selectedSuggestions.length >= 3) break;
      if (!existingNames.has(s.name)) {
        selectedSuggestions.push(s);
        existingNames.add(s.name);
      }
    }
  }
  const quoteList = quotes as string[];
  const randomQuote = quoteList[Math.floor(Math.random() * quoteList.length)];
  const responseStr = (moodResponses as Record<string, string>)[mood] || 'Your mood is as unique as a custom-made dessert! 🍰';

  return {
    response: responseStr,
    foodSuggestions: selectedSuggestions,
    quote: randomQuote,
    poetry: (moodPoetry as Record<string, string>)[mood]
  } as MoodAnalysis;
};

// Call Gemini/backend API for enriched suggestions (async)
export const analyzeMood = async (journalEntry: string, mood: string): Promise<MoodAnalysis> => {
  if (!USE_MOCK) {
    // Add a simple in-memory cache per runtime to avoid repeated calls for identical inputs
    try {
      const cacheKey = `api:analyze:${mood}:${String(journalEntry).slice(0,200)}`;
      // @ts-expect-error: attach cache to module (safe in single-process dev)
      if (!global.__apiCache) global.__apiCache = new Map();
      // @ts-expect-error: using global cache
      const gc: Map<string, { ts: number; value: MoodAnalysis }> = global.__apiCache;
      const cached = gc.get(cacheKey);
      const now = Date.now();
      if (cached && now - cached.ts < (Number(process.env.API_CACHE_TTL_MS) || 1000 * 60 * 30)) {
        return cached.value as MoodAnalysis;
      }

      // In production/non-mock mode call the backend endpoint
      // The backend is responsible for contacting the AI API (and keeping secrets server-side)
      const endpoint = '/api/analyze';
      const serverResp = await callServerlessAnalyze(endpoint, journalEntry, mood);
      gc.set(cacheKey, { ts: now, value: serverResp });
      return serverResp as MoodAnalysis;
    } catch (err) {
      console.warn('API analyze failed, falling back to local suggestions', err);
      // Fallback to hard-coded suggestions if API fails
      return getInitialSuggestions(mood);
    }
  }

  // In mock mode, still return hard-coded suggestions
  return getInitialSuggestions(mood);
};

// Get fresh AI-generated suggestions without caching (for refresh button)
export const getRefreshSuggestions = async (journalEntry: string, mood: string): Promise<MoodAnalysis> => {
  console.log('getRefreshSuggestions called - USE_MOCK:', USE_MOCK, 'mood:', mood);
  if (!USE_MOCK) {
    try {
      // Call the backend endpoint without caching to get fresh suggestions
      const endpoint = '/api/analyze';
      console.log('Calling API endpoint:', endpoint);
      const serverResp = await callServerlessAnalyze(endpoint, journalEntry, mood);
      console.log('Successfully received fresh suggestions from API');
      return serverResp as MoodAnalysis;
    } catch (err) {
      console.warn('API refresh failed, falling back to local suggestions', err);
      // Fallback to hard-coded suggestions if API fails
      return getInitialSuggestions(mood);
    }
  }

  // In mock mode, return hard-coded suggestions
  console.log('Mock mode - returning shuffled suggestions');
  return getInitialSuggestions(mood);
};

export const generateMeme = async (mood: string): Promise<Meme> => {
  // Per product decision memes should not be generated by Grok.
  // Always use local static memes to avoid external calls and secrets exposure.
  await new Promise((res) => setTimeout(res, 50));
  const moodMap = memes as Record<string, Meme>;
  return moodMap[mood] || moodMap['happy'];
};

export default {
  analyzeMood,
  getInitialSuggestions,
  getRefreshSuggestions,
  generateMeme,
  moodSpotifyPlaylists
};
