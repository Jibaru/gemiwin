import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout />
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