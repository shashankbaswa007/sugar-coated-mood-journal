              Sugar Mood Lifter 
Problem Statement : 
With today's hectic pace, people are having trouble with day-to-day emotional swings. Conventional self-care devices may come across as clinical or out of reach. There is a need for a light-hearted, emotionally intelligent device that provides comfort and insight without being overwhelming to use.
Solution :
Sugar Mood Lifter a simple, unique yet effective way to deliver emotional support and happiness through:
- Mood selection with a friendly, animated UI.
- Recommendations for sweet treats that fit your mood.
- Mood-based daily journal feature.
- Meme and quote generators matching your mood.
- AI-powered mood analysis (supports Gemini API).

- Suggests the Swiggy/Zomato link for the suggested treat. There is also an option to just check the recipe if you're in a mood to cook instead of being lazy for once..
Top Features :
Mood Picker: Select your current mood through emoji-based UI.
Sweet Treat Generator: Receive handpicked sweet recommendations with your mood.
AI Journal Reader: Jot down your ideas and have Gemini determine your emotional tone.
Mood Memes: Encouraging memes and quotes come up contextually.
Dark/Light Mode
Adaptive Design
Seamless Animations
Spotify playlist suggestion depending on your mood

Also u can find the links of Swiggy and Zomato such that u can order the sugar treats 

Tech Stack :
Frontend: React + TypeScript
Styling: Material-UI, CSS
Animations: Framer Motion
Routing: React Router
AI Integration: Gemini API (optional - works with local data too)
State Management: React Context API

Application Flow
1. User comes to Home Page → chooses their mood.
2. App shows: Matching desserts and a mood-matching meme.
3. User is asked to journal-write.
4. App provides instant food suggestions from curated local data.
5. (Optional) App can analyze journal tone using Gemini API if configured.
6. User departs the app feeling rejuvenated.
What Makes It Special?
• Positive Psychology Meets AI: Intelligent emotional feedback during journaling.
• Wholesome Distractions: Employs playful (memes + desserts) as therapeutic tools.

Future Enhancements
->Dashboard for mood tracking
->Intelligent journal prompts
->Customizable dessert database
->Plugin support for moods/themes

Developer Setup & Notes
-----------------------
- The project uses mocked Gemini API data by default. To toggle real API integration, set environment variables in `.env` (copied from `.env.example`).
- Quick dev: run `npm install` then `npm start`.
 - Quick dev: run `npm install` then `npm start`.
 - Visit `/dashboard` to view the Mood Dashboard showing mood counts per journal entries.
- The app now persists the selected mood and dark mode in `localStorage`.
- Journal entries and analysis are stored locally in `localStorage` as a simple history (no backend yet).

Privacy
-------
- This project stores journal entries in the browser's `localStorage` only. No data is sent to any server unless you configure a Gemini proxy or enable remote storage. If you integrate a serverless API, ensure your privacy policy and data handling comply with local laws and secure API keys.

Testing & CI
------------
- Run tests: `npm test`.
- A GitHub Actions workflow is included (`.github/workflows/ci.yml`) that runs tests and builds the project for every PR and push to `main`.



Summary of the Project
Sugar Mood Lifter is a mental wellness companion in the form of a website that smartly suggests sweet desserts, memes, and thought-provoking journaling experiences depending on your mood. Merging psychology with AI and a dash of humor, it seeks to improve emotional well-being in a fun and interactive manner.

# sugar-coated-
# sugar-coated-mood-journal

Aggregated (All-Users) Mood Data
--------------------------------

The Dashboard can show aggregated mood counts for all users if you provide an API endpoint. Set the `REACT_APP_ALL_USERS_API_URL` environment variable to point to an endpoint that returns a JSON object mapping mood keys to counts, for example:

```json
{
    "happy": 120,
    "sad": 40,
    "stressed": 30
}
```

If this variable is not set the app will only display your personal mood counts (from localStorage) and an informational message explaining how to enable the all-users chart.

Local development mock API
--------------------------

If you want to demo the All Users chart locally without a backend, start the included mock server:

```bash
npm run start:api
```

Then set `REACT_APP_ALL_USERS_API_URL=http://localhost:4001/api/all-users/moods` in your `.env` (or export it in your shell) and restart the dev server. The mock returns a realistic demo payload that the Dashboard will consume.

Note: If you run the app in development mode (`NODE_ENV=development`) and do not set `REACT_APP_ALL_USERS_API_URL`, the dashboard will automatically try `http://localhost:4001/api/all-users/moods`. Start the mock API with `npm run start:api` to make the All Users chart populate automatically during development.

Monthly Summaries (Future Feature)
------------------------
This project can be extended to call Gemini for monthly summaries. See `API_SETUP_GUIDE.md` for details on configuring the Gemini API integration.

