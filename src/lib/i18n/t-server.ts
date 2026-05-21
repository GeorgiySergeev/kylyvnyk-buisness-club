import 'server-only';

import a11y from '../../../messages/en/a11y.json';
import auth from '../../../messages/en/auth.json';
import footer from '../../../messages/en/footer.json';
import nav from '../../../messages/en/nav.json';

const MESSAGES = {
  a11y,
  auth,
  footer,
  nav,
} as const;

type Messages = typeof MESSAGES;
type Namespace = keyof Messages;
type Key<N extends Namespace> = keyof Messages[N] & string;

export function getT<N extends Namespace>(namespace: N): (key: Key<N>) => string {
  const scopedMessages = MESSAGES[namespace];

  return (key) => scopedMessages[key] as string;
}
