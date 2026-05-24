import 'server-only';

import a11y from '../../../messages/en/a11y.json';
import admin from '../../../messages/en/admin.json';
import auth from '../../../messages/en/auth.json';
import cards from '../../../messages/en/cards.json';
import footer from '../../../messages/en/footer.json';
import home from '../../../messages/en/home.json';
import nav from '../../../messages/en/nav.json';
import placeholders from '../../../messages/en/placeholders.json';

const MESSAGES = {
  a11y,
  admin,
  auth,
  cards,
  footer,
  home,
  nav,
  placeholders,
} as const;

type Messages = typeof MESSAGES;
type Namespace = keyof Messages;
export type Key<N extends Namespace> = keyof Messages[N] & string;

export function getT<N extends Namespace>(namespace: N): (key: Key<N>) => string {
  const scopedMessages = MESSAGES[namespace];

  return (key) => scopedMessages[key] as string;
}
