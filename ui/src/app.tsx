import React, { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout';
import { SplashScreen } from '@/components/splash-screen';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {showSplash ? (
        <SplashScreen onContinue={() => setShowSplash(false)} />
      ) : (
        <Layout />
      )}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { background: '#333', color: '#fff' },
          className: 'rounded-md text-sm',
        }}
      />
    </ThemeProvider>
  );
};

export default App; 