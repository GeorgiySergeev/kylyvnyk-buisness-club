import 'server-only';

import a11y from '../../../messages/en/a11y.json';
import auth from '../../../messages/en/auth.json';
import footer from '../../../messages/en/footer.json';
import home from '../../../messages/en/home.json';
import nav from '../../../messages/en/nav.json';
import placeholders from '../../../messages/en/placeholders.json';

const MESSAGES = {
  a11y,
  auth,
  footer,
  home,
  nav,
  placeholders,
} as const;

type Messages = typeof MESSAGES;
type Namespace = keyof Messages;
type Key<N extends Namespace> = keyof Messages[N] & string;

export function getT<N extends Namespace>(namespace: N): (key: Key<N>) => string {
  const scopedMessages = MESSAGES[namespace];

  return (key) => scopedMessages[key] as string;
}
