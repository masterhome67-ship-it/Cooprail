export const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3-flash-preview',
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number];
