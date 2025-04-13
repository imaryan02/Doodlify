import React, { createContext, useContext, useState, useCallback } from 'react';

interface DrawingContextType {
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEmojiMode: boolean;
  setIsEmojiMode: (mode: boolean) => void;
  clearCanvas: () => void;
  saveCanvas: () => void;
  triggerAIMagic: () => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brushColor, setBrushColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(5);
  const [isEmojiMode, setIsEmojiMode] = useState(false);

  const clearCanvas = useCallback(() => {
    const canvas = document.querySelector('canvas');
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const saveCanvas = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'doodlify-masterpiece.png';
      link.href = dataUrl;
      link.click();
    }
  }, []);

  const triggerAIMagic = useCallback(() => {
    const canvas = document.querySelector('canvas');
    const context = canvas?.getContext('2d');
    if (!context || !canvas) return;

    const emojis = ['✨', '🌈', '🎨', '🎉', '💫', '⭐'];
    const numEmojis = 20;

    for (let i = 0; i < numEmojis; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const size = Math.random() * 30 + 20;

      context.font = `${size}px Arial`;
      context.fillText(emoji, x, y);
    }
  }, []);

  return (
    <DrawingContext.Provider
      value={{
        brushColor,
        setBrushColor,
        brushSize,
        setBrushSize,
        isEmojiMode,
        setIsEmojiMode,
        clearCanvas,
        saveCanvas,
        triggerAIMagic,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
};

export const useDrawingContext = () => {
  const context = useContext(DrawingContext);
  if (context === undefined) {
    throw new Error('useDrawingContext must be used within a DrawingProvider');
  }
  return context;
};