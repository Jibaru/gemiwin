import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout />
    </ThemeProvider>
  );
};

export default App; 