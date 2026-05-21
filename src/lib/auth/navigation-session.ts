import 'server-only';

import type { SessionRole } from '@/components/layout/navigation';

export interface NavigationSession {
  role: SessionRole;
  userId?: string;
  displayName?: string;
  avatarUrl?: string;
}

const GUEST_SESSION: NavigationSession = {
  role: 'guest',
};

export async function getNavigationSession(): Promise<NavigationSession> {
  return GUEST_SESSION;
}
