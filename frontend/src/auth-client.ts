import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters';

// We use the provided Neon Auth URL
const authUrl = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-royal-sound-b37l2mgc.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth';

export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(), // Required for React hooks
});
