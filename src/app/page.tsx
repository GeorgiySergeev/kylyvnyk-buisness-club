// BLOCK: Root redirect page — redirects to the default locale root. This is a simple routing shim.
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}
