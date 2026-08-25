import { Suspense } from 'react';
import CheckoutConfirmPage from './ConfirmClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="xp-wrap pt-28 text-white/60">Verifying payment…</div>}>
      <CheckoutConfirmPage />
    </Suspense>
  );
}
