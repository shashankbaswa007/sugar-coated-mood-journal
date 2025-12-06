export type Mood =
  | 'happy'
  | 'sad'
  | 'stressed'
  | 'energetic'
  | 'sleepy'
  | 'excited'
  | 'grateful'
  | 'hopeful'
  | 'peaceful'
  | 'anxious'
  | 'nostalgic'
  | 'inspired';

export interface FoodSuggestion {
  name: string;
  description: string;
  recipe: string;
  orderLink: string;
  youtubeLink: string;
}

export interface Meme {
  imageUrl: string;
  caption: string;
  description: string;
}

export interface MoodAnalysis {
  response: string;
  foodSuggestions: FoodSuggestion[];
  quote: string;
  poetry?: string;
  meme?: Meme;
  likedSuggestions?: FoodSuggestion[];
}
