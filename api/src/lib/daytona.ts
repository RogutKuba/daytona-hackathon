import { Daytona } from '@daytonaio/sdk';
import { env } from '@/lib/env';

// Initialize the Daytona client
export const daytona = new Daytona({ apiKey: env.DAYTONA_API_KEY });
