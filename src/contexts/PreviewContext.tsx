import { createContext, useContext, useState, ReactNode } from 'react';

interface PreviewContextType {
  isPreviewMode: boolean;
  setPreviewMode: (value: boolean) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [isPreviewMode, setPreviewMode] = useState(false);

  return (
    <PreviewContext.Provider value={{ isPreviewMode, setPreviewMode }}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within PreviewProvider');
  }
  return context;
}
