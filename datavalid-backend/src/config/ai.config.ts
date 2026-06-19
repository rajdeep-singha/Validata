import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const AI_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-5';
export const MAPPING_MAX_TOKENS = 1024;
export const FIX_MAX_TOKENS = 2048;
export const SUMMARY_MAX_TOKENS = 1500;
export const AI_RATE_LIMIT_WINDOW_MS = parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || '60000', 10);
export const AI_RATE_LIMIT_MAX = parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || '20', 10);
