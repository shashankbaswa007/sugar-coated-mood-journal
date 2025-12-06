import { analyzeMood, generateMeme } from './geminiService';

describe('geminiService (mock)', () => {
  it('returns an analysis with required fields', async () => {
    const result = await analyzeMood('I am excited about my day', 'happy');
    expect(result).toHaveProperty('response');
    expect(result.foodSuggestions).toBeInstanceOf(Array);
    expect(result.quote).toBeDefined();
  });

  it('returns a meme object', async () => {
    const meme = await generateMeme('sad');
    expect(meme).toHaveProperty('imageUrl');
    expect(meme.caption).toBeDefined();
  });
});
