// src/components/CanvasSection.tsx
import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  Ref,
  useCallback,
} from 'react';
import EmojiKeyboardModal from './EmojiKeyboardModal'; // Ensure this component exists
import Toolbar from './Toolbar'; // Ensure this component exists and matches the updated props

export interface CanvasSectionRef {
  scrollToCanvas: () => void;
}

// Default list of emojis
const emojiList = ['✨', '❤️', '😍', '⭐', '🌈', '🎨', '💫', '🦋', '🌸', '😊', '👍', '💡'];

// --- Helper Functions ---

// Convert Hex color to RGB object
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate color difference (simple Euclidean distance squared)
function colorDistance(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number }
): number {
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  // Using squared distance avoids Math.sqrt, faster for comparison
  return dr * dr + dg * dg + db * db;
}

// Check if two colors are similar within a tolerance
// toleranceSq is the maximum allowed *squared* distance
function colorsAreSimilar(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number },
  toleranceSq: number
): boolean {
  // Ensure valid RGB objects before comparison
  if (!rgb1 || !rgb2) return false;
  return colorDistance(rgb1, rgb2) <= toleranceSq;
}
// --- End Helper Functions ---

const CanvasSection = forwardRef(function CanvasSection(
  _,
  ref: Ref<CanvasSectionRef>
) {
  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitialMount = useRef(true); // Track first mount for initial state saving
  const shapeStartPosRef = useRef<{ x: number; y: number } | null>(null); // Start coords for shapes/lines
  const canvasSnapshotRef = useRef<ImageData | null>(null); // For shape/line preview restoration

  // --- State ---

  // Core drawing states
  const [isDrawing, setIsDrawing] = useState(false); // Is mouse button currently down and drawing?
  const [color, setColor] = useState('#8b5cf6'); // Current selected color
  const [size, setSize] = useState(5); // Current selected size (for brush, stroke width, etc.)
  const [selectedTool, setSelectedTool] = useState<string>('pencil'); // Active tool name

  // Undo/Redo and canvas configuration
  const [undoStack, setUndoStack] = useState<string[]>([]); // History for undo
  const [redoStack, setRedoStack] = useState<string[]>([]); // History for redo
  const [canvasSizeMode, setCanvasSizeMode] = useState<'small' | 'medium' | 'full'>('medium'); // Canvas display size preset
  const [saveFormat, setSaveFormat] = useState<'png' | 'jpg'>('png'); // Format for download

  // Emoji related states
  const [emojiKeyboardOpen, setEmojiKeyboardOpen] = useState(false); // Is the emoji picker modal open?
  const [selectedEmoji, setSelectedEmoji] = useState<string>(emojiList[0]); // Currently selected emoji to draw

  // Shape/Line specific states (controlled via Toolbar)
  // Ensure the type here matches what the Toolbar expects for setSelectedShape prop
  const [selectedShape, setSelectedShape] = useState<'rectangle' | 'circle' | 'line'>('rectangle');
  const [shapeFill, setShapeFill] = useState<boolean>(false); // Fill option for shapes
  const [shapeStroke, setShapeStroke] = useState<boolean>(true); // Stroke option for shapes

  // Fill tool specific state
  const [fillTolerance, setFillTolerance] = useState<number>(30); // Color matching tolerance (0-255 range, used squared internally)

  // UI state
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // Current mouse position over canvas

  // --- Imperative Handle ---
  // Exposes a function to parent components to scroll this section into view
  useImperativeHandle(ref, () => ({
    scrollToCanvas: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
  }));

  // --- Canvas Setup and Resizing ---

  // Saves the initial blank canvas state to the undo stack
  const saveInitialCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && isInitialMount.current) {
      ctx.fillStyle = '#FFFFFF'; // Ensure defined background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const initialState = canvas.toDataURL();
      setUndoStack([initialState]); // Initialize undo stack
      setRedoStack([]);
      isInitialMount.current = false; // Mark as done
      console.log("Initial canvas state saved.");
    }
  }, []);

  // Responsive and adaptive canvas dimensions
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save current drawing before resizing
    const currentDrawing = canvas.toDataURL();

    // Determine if the device is mobile (screen width less than 768px)
    const isMobile = window.innerWidth < 768;
    let newWidth: number;
    let newHeight: number;

    switch (canvasSizeMode) {
      case 'small':
        newWidth = isMobile ? window.innerWidth * 0.9 : window.innerWidth * 0.5;
        newHeight = isMobile ? window.innerHeight * 0.3 : window.innerHeight * 0.4;
        break;
      case 'full':
        newWidth = window.innerWidth * 0.95;
        newHeight = window.innerHeight * 0.75;
        break;
      case 'medium':
      default:
        newWidth = isMobile ? window.innerWidth * 0.9 : window.innerWidth * 0.5;
        newHeight = isMobile ? window.innerHeight * 0.35 : window.innerHeight * 0.55;
        break;
    }

    // Apply new dimensions with a minimum limit
    canvas.width = Math.max(100, newWidth);
    canvas.height = Math.max(100, newHeight);

    // Get context and restore drawing
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Ensure background color is set after resize
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Restore the previous drawing if it isn't blank
      if (currentDrawing && currentDrawing !== "data:,") {
        const img = new Image();
        img.onload = () => {
          // Adjust drawing to new size
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = currentDrawing;
      }
    }

    // Save the initial state only on the first mount
    if (isInitialMount.current) {
      saveInitialCanvasState();
    }
  }, [canvasSizeMode, saveInitialCanvasState]);

  // Effect to set initial dimensions and update on window resize
  useEffect(() => {
    updateCanvasDimensions(); // Set size on mount
    window.addEventListener('resize', updateCanvasDimensions);
    return () =>
      window.removeEventListener('resize', updateCanvasDimensions); // Cleanup listener
  }, [updateCanvasDimensions]);

  // --- Coordinate Calculation ---
  // Gets canvas-relative coordinates from mouse or touch event
  const getCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 }; // Return default if canvas not ready

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // --- Flood Fill Implementation ---
  const floodFill = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!ctx || !canvas) return;

    const targetColorRgb = hexToRgb(color);
    if (!targetColorRgb) {
      console.error("Invalid fill color selected:", color);
      return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    } catch (error) {
      console.error("Could not get ImageData (maybe tainted canvas?):", error);
      alert("Could not perform fill operation due to canvas security restrictions.");
      return;
    }
    const data = imageData.data;

    const startXint = Math.floor(startX);
    const startYint = Math.floor(startY);
    if (startXint < 0 || startXint >= canvasWidth || startYint < 0 || startYint >= canvasHeight) {
      console.log("Fill start point out of bounds.");
      return;
    }

    const startPixelPos = (startYint * canvasWidth + startXint) * 4;
    const startColor = {
      r: data[startPixelPos],
      g: data[startPixelPos + 1],
      b: data[startPixelPos + 2],
    };

    const toleranceSquared = fillTolerance * fillTolerance;
    if (colorsAreSimilar(startColor, targetColorRgb, toleranceSquared)) {
      console.log("Start color is already the target color.");
      return;
    }

    const pixelsToCheck: [number, number][] = [[startXint, startYint]];
    const processed = new Set<string>([`${startXint},${startYint}`]);

    let iterations = 0;
    const maxIterations = canvasWidth * canvasHeight * 1.5;
    while (pixelsToCheck.length > 0) {
      iterations++;
      if (iterations > maxIterations) {
        console.error("Flood fill exceeded maximum iterations. Stopping.");
        alert("Fill operation took too long and was stopped. Try reducing tolerance or filling a smaller area.");
        return;
      }
      const [x, y] = pixelsToCheck.shift()!;
      const currentPixelPos = (y * canvasWidth + x) * 4;
      const currentColor = {
        r: data[currentPixelPos],
        g: data[currentPixelPos + 1],
        b: data[currentPixelPos + 2],
      };

      if (colorsAreSimilar(currentColor, startColor, toleranceSquared)) {
        data[currentPixelPos] = targetColorRgb.r;
        data[currentPixelPos + 1] = targetColorRgb.g;
        data[currentPixelPos + 2] = targetColorRgb.b;
        data[currentPixelPos + 3] = 255;

        const neighbors: [number, number][] = [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1],
        ];
        for (const [nx, ny] of neighbors) {
          const neighborKey = `${nx},${ny}`;
          if (nx >= 0 && nx < canvasWidth && ny >= 0 && ny < canvasHeight && !processed.has(neighborKey)) {
            pixelsToCheck.push([nx, ny]);
            processed.add(neighborKey);
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    console.log("Flood fill complete.");
    saveCanvasState();
  };

  // --- Drawing Event Handlers ---
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!ctx || !canvas) return;

    const { x, y } = getCoords(e);
    setCursorPos({ x, y });
    ctx.globalCompositeOperation = 'source-over';

    if (selectedTool === 'pencil' || selectedTool === 'eraser' || selectedTool === 'spray' || selectedTool === 'line') {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
      if (selectedTool === 'pencil' || selectedTool === 'line') {
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        if (selectedTool === 'line') {
          canvasSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
          shapeStartPosRef.current = { x, y };
        }
      } else if (selectedTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = size * 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (selectedTool === 'spray') {
        ctx.fillStyle = color;
        sprayPaint(ctx, x, y);
      }
    } else if (selectedTool === 'shape') {
      setIsDrawing(true);
      shapeStartPosRef.current = { x, y };
      canvasSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else if (selectedTool === 'emoji') {
      drawEmoji(ctx, x, y);
      saveCanvasState();
    } else if (selectedTool === 'text') {
      const text = prompt("Enter text:", "Doodlify!");
      if (text) {
        ctx.fillStyle = color;
        ctx.font = `${Math.max(12, size * 2.5)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(text, x, y);
        saveCanvasState();
      }
    } else if (selectedTool === 'fill') {
      floodFill(x, y);
      setIsDrawing(false);
    } else if (selectedTool === 'ai') {
      alert(`"${selectedTool}" tool is not implemented yet!`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const { x, y } = getCoords(e);
    setCursorPos({ x, y });

    if (!isDrawing) return;

    if (selectedTool === 'pencil') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (selectedTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (selectedTool === 'spray') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = color;
      sprayPaint(ctx, x, y);
    } else if (selectedTool === 'line' || selectedTool === 'shape') {
      if (canvasSnapshotRef.current && shapeStartPosRef.current) {
        ctx.putImageData(canvasSnapshotRef.current, 0, 0);
        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalCompositeOperation = 'source-over';

        const startX = shapeStartPosRef.current.x;
        const startY = shapeStartPosRef.current.y;
        const currentX = x;
        const currentY = y;

        ctx.beginPath();
        if (selectedTool === 'line') {
          ctx.moveTo(startX, startY);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
        } else if (selectedTool === 'shape') {
          if (selectedShape === 'rectangle') {
            if (shapeFill) ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
            if (shapeStroke) ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
          } else if (selectedShape === 'circle') {
            const dx = currentX - startX;
            const dy = currentY - startY;
            const radius = Math.sqrt(dx * dx + dy * dy);
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            if (shapeFill) ctx.fill();
            if (shapeStroke) ctx.stroke();
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing && !(selectedTool === 'shape' || selectedTool === 'line')) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.closePath();
    if (selectedTool === 'pencil' || selectedTool === 'eraser' || selectedTool === 'spray') {
      saveCanvasState();
    } else if (selectedTool === 'line' || selectedTool === 'shape') {
      if (canvasSnapshotRef.current && shapeStartPosRef.current) {
        ctx.putImageData(canvasSnapshotRef.current, 0, 0);
        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalCompositeOperation = 'source-over';

        const startX = shapeStartPosRef.current.x;
        const startY = shapeStartPosRef.current.y;
        const { x: endX, y: endY } = cursorPos;

        ctx.beginPath();
        if (selectedTool === 'line') {
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        } else if (selectedTool === 'shape') {
          const doStroke = shapeStroke || (!shapeFill && !shapeStroke);
          if (selectedShape === 'rectangle') {
            if (shapeFill) ctx.fillRect(startX, startY, endX - startX, endY - startY);
            if (doStroke) ctx.strokeRect(startX, startY, endX - startX, endY - startY);
          } else if (selectedShape === 'circle') {
            const dx = endX - startX;
            const dy = endY - startY;
            const radius = Math.sqrt(dx * dx + dy * dy);
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            if (shapeFill) ctx.fill();
            if (doStroke) ctx.stroke();
          }
        }
        saveCanvasState();
      }
      shapeStartPosRef.current = null;
      canvasSnapshotRef.current = null;
    }
  };

  // --- State Saving & Manipulation Helpers ---
  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== dataUrl) {
        setUndoStack((prev) => [...prev, dataUrl]);
        setRedoStack([]);
      }
    }
  }, [undoStack]);

  const drawEmoji = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.font = `${size * 3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedEmoji, x, y);
  };

  const sprayPaint = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const density = Math.max(10, size);
    for (let i = 0; i < density; i++) {
      const radius = Math.random() * (size / 3);
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * size * 1.5;
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, Math.max(0.5, radius), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    saveCanvasState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  // --- Undo / Redo Logic ---
  const undo = () => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const prevState = undoStack[undoStack.length - 2];
    const currentState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, currentState]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prevState;
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, nextState]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = nextState;
  };

  // --- UI Control Handlers ---
  const toggleCanvasSize = () => {
    setCanvasSizeMode((prev) =>
      prev === 'small' ? 'medium' : prev === 'medium' ? 'full' : 'small'
    );
  };

  const cycleSaveFormat = () => {
    setSaveFormat((prev) => (prev === 'png' ? 'jpg' : 'png'));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const borderSize = 20;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width + borderSize * 2;
    offscreenCanvas.height = canvas.height + borderSize * 2;
    const offCtx = offscreenCanvas.getContext('2d');
    if (!offCtx) return;
    offCtx.fillStyle = '#FFFFFF';
    offCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offCtx.drawImage(canvas, borderSize, borderSize);
    offCtx.strokeStyle = color;
    offCtx.lineWidth = 8;
    offCtx.strokeRect(
      borderSize / 2,
      borderSize / 2,
      offscreenCanvas.width - borderSize,
      offscreenCanvas.height - borderSize
    );
    offCtx.font = '18px "Comic Sans MS", cursive, sans-serif';
    offCtx.fillStyle = color;
    offCtx.textAlign = 'center';
    offCtx.fillText(
      'Hey! I made a doodle on Doodlify!',
      offscreenCanvas.width / 2,
      offscreenCanvas.height - borderSize / 2 - 5
    );
    const link = document.createElement('a');
    const mimeType = saveFormat === 'png' ? 'image/png' : 'image/jpeg';
    link.download = `doodlify_art.${saveFormat}`;
    link.href = offscreenCanvas.toDataURL(mimeType, 0.9);
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!navigator.share || !navigator.canShare) {
      alert('Sharing is not supported in your browser. Please download the image instead.');
      return;
    }
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Canvas toBlob failed.');
          alert('Could not create image blob for sharing.');
          return;
        }
        const file = new File([blob], `doodlify_art.png`, { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Doodlify Artwork',
            text: 'Check out my creative Doodlify masterpiece!',
            files: [file],
          });
          console.log('Shared successfully');
        } else {
          alert("Your browser cannot share this type of file.");
        }
      }, 'image/png', 0.9);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        alert(`Sharing failed: ${error.message}`);
      } else {
        console.log('Share cancelled by user.');
      }
    }
  };

  const saveCanvas = () => {
    alert('Save canvas to browser storage feature is not implemented yet!');
  };

  // --- Cursor Style Logic ---
  const getCursorStyle = (): string => {
    switch (selectedTool) {
      case 'pencil': return 'crosshair';
      case 'eraser': return 'grab';
      case 'shape': return 'crosshair';
      case 'line': return 'crosshair';
      case 'text': return 'text';
      case 'spray': return 'crosshair';
      case 'emoji': return 'pointer';
      case 'fill': return 'copy';
      case 'ai': return 'wait';
      default: return 'default';
    }
  };

  // --- JSX Rendering ---
  return (
    <section ref={containerRef} className="my-10 w-full flex flex-col items-center px-2">
      {/* Canvas Wrapper */}
      <div
        className="relative shadow-2xl rounded-3xl border-2 border-purple-200 bg-white overflow-hidden touch-none"
        style={{
          width: canvasRef.current?.width ? `${canvasRef.current.width}px` : '80vw',
          height: canvasRef.current?.height ? `${canvasRef.current.height}px` : '50vh',
          maxWidth: '100%',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ display: 'block', cursor: getCursorStyle() }}
        />
        {/* Brush/Tool Preview Overlay Elements */}
        {!isDrawing && cursorPos.x > 0 && cursorPos.y > 0 && (
          <>
            {(selectedTool === 'pencil' || selectedTool === 'line') && (
              <div
                className="absolute pointer-events-none rounded-full border border-dashed opacity-50"
                style={{
                  top: cursorPos.y,
                  left: cursorPos.x,
                  width: size,
                  height: size,
                  borderColor: color,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
            {selectedTool === 'eraser' && (
              <div
                className="absolute pointer-events-none rounded-full border-2 border-gray-400 bg-white bg-opacity-50"
                style={{
                  top: cursorPos.y,
                  left: cursorPos.x,
                  width: size * 1.5,
                  height: size * 1.5,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
            {selectedTool === 'shape' && (
              <div
                className="absolute pointer-events-none border-l border-t border-gray-500 opacity-70"
                style={{
                  top: cursorPos.y,
                  left: cursorPos.x,
                  width: 20,
                  height: 20,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
            {selectedTool === 'fill' && (
              <div
                className="absolute pointer-events-none text-xl"
                style={{
                  top: cursorPos.y,
                  left: cursorPos.x,
                  transform: 'translate(-2px, -25px)',
                }}
              >
                🪣
              </div>
            )}
          </>
        )}
      </div>
      {/* Emoji Keyboard Modal */}
      {emojiKeyboardOpen && (
        <EmojiKeyboardModal
          onSelect={(emoji) => {
            setSelectedEmoji(emoji);
            setEmojiKeyboardOpen(false);
          }}
          onClose={() => setEmojiKeyboardOpen(false)}
        />
      )}
      {/* Toolbar Component */}
      <Toolbar
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        setEmojiKeyboardOpen={setEmojiKeyboardOpen}
        clearCanvas={clearCanvas}
        undo={undo}
        redo={redo}
        toggleCanvasSize={toggleCanvasSize}
        cycleSaveFormat={cycleSaveFormat}
        saveFormat={saveFormat}
        handleDownload={handleDownload}
        handleShare={handleShare}
        saveCanvas={saveCanvas}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        shapeFill={shapeFill}
        setShapeFill={setShapeFill}
        shapeStroke={shapeStroke}
        setShapeStroke={setShapeStroke}
        fillTolerance={fillTolerance}
        setFillTolerance={setFillTolerance}
      />
    </section>
  );
});

export default CanvasSection;
