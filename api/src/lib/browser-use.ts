import { BrowserUseClient } from 'browser-use-sdk';
import { env } from '@/lib/env';

export const browserUse = new BrowserUseClient({
  apiKey: env.BROWSER_USE_API_KEY,
});
