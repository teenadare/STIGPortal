'use client';

// The STIG Portal is a client-rendered react-router SPA mounted on a single
// Next.js catch-all route. We render it only after mount (client-only) so
// react-router's BrowserRouter never runs during SSR. A mounted-guard is used
// instead of next/dynamic(ssr:false) because the lazy/Suspense client takeover
// is unreliable behind this environment's dev proxy.
import { useState, useEffect } from 'react';
import App from '@/App';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} />;
  return <App />;
}
