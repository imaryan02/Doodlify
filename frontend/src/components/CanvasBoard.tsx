import React, { useRef, useEffect, useState } from 'react';
import { useDrawingContext } from '../context/DrawingContext';

export const CanvasBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { brushColor, brushSize, isEmojiMode } = useDrawingContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = window.innerHeight * 0.6;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
      contextRef.current = context;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const context = contextRef.current;
    if (context) {
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const { x, y } = getCoordinates(e, canvas);
    
    if (isEmojiMode) {
      drawEmoji(x, y);
    } else {
      context.beginPath();
      context.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const { x, y } = getCoordinates(e, canvas);
    
    if (isEmojiMode) {
      drawEmoji(x, y);
    } else {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const context = contextRef.current;
    if (!context) return;
    context.closePath();
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const drawEmoji = (x: number, y: number) => {
    const context = contextRef.current;
    if (!context) return;
    
    const emojis = ['✨', '❤️', '😍', '⭐', '🌈', '🎨', '💫', '🦋', '🌸'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    context.font = `${brushSize * 2}px Arial`;
    context.fillText(emoji, x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      className="bg-white rounded-3xl shadow-2xl cursor-crosshair touch-none hover:shadow-violet-200/50 transition-shadow duration-300"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};