'use client';

import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#11111c',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#f0f0ff',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
        closeButton
      />
    </>
  );
}
