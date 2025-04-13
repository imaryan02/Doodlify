// src/components/Toolbar.tsx
import { useState, useEffect } from 'react';

// Define TypeScript interface for the component's props
interface ToolbarProps {
  // Color & size controls
  color: string;
  setColor: (color: string) => void;
  size: number;
  setSize: (size: number) => void;

  // Emoji keyboard control
  setEmojiKeyboardOpen: (open: boolean) => void;

  // Core canvas actions
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  toggleCanvasSize: () => void;
  cycleSaveFormat: () => void;
  saveFormat: string;
  handleDownload: () => void;
  handleShare: () => void;
  saveCanvas: () => void;

  // Tool selection state
  selectedTool: string;
  setSelectedTool: (tool: string) => void;

  // Shape Tool Specific Props
  selectedShape: 'rectangle' | 'circle' | 'line';
  setSelectedShape: (shape: 'rectangle' | 'circle' | 'line') => void;
  shapeFill: boolean;
  setShapeFill: (fill: boolean) => void;
  shapeStroke: boolean;
  setShapeStroke: (stroke: boolean) => void;

  // Fill Tool Specific Props
  fillTolerance: number;
  setFillTolerance: (tolerance: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  color,
  setColor,
  size,
  setSize,
  setEmojiKeyboardOpen,
  clearCanvas,
  undo,
  redo,
  toggleCanvasSize,
  cycleSaveFormat,
  saveFormat,
  handleDownload,
  handleShare,
  saveCanvas,
  selectedTool,
  setSelectedTool,
  selectedShape,
  setSelectedShape,
  shapeFill,
  setShapeFill,
  shapeStroke,
  setShapeStroke,
  fillTolerance,
  setFillTolerance,
}) => {
  // Animation state for active tool indicator
  const [animPosition, setAnimPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Returns true if the given tool name matches the currently selected tool
  const isActiveTool = (tool: string): boolean => selectedTool === tool;

  // Handles selecting a tool button
  const selectTool = (tool: string, event?: React.MouseEvent): void => {
    setSelectedTool(tool);
    
    // Trigger animation when tool changes
    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setAnimPosition({ 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
      });
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }

    // Specific action for emoji tool: open the keyboard
    if (tool === 'emoji') {
      setEmojiKeyboardOpen(true);
    }
  };

  // Colors for each tool (neon palette)
  const toolColors = {
    pencil: { from: 'from-pink-500', to: 'to-rose-500', text: 'text-pink-500', glow: 'shadow-pink-500/30' },
    eraser: { from: 'from-gray-400', to: 'to-slate-600', text: 'text-gray-300', glow: 'shadow-gray-500/20' },
    shape: { from: 'from-green-400', to: 'to-teal-500', text: 'text-green-400', glow: 'shadow-green-500/30' },
    line: { from: 'from-indigo-500', to: 'to-blue-500', text: 'text-indigo-400', glow: 'shadow-indigo-500/30' },
    text: { from: 'from-yellow-400', to: 'to-amber-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
    fill: { from: 'from-cyan-400', to: 'to-blue-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
    emoji: { from: 'from-fuchsia-400', to: 'to-pink-500', text: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/30' },
    spray: { from: 'from-teal-400', to: 'to-cyan-500', text: 'text-teal-400', glow: 'shadow-teal-500/30' },
    ai: { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-400', glow: 'shadow-violet-500/30' },
  };

  // Base style for tool buttons
  const baseBtn = "relative z-10 px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-1";
  
  // Generate tool button class with glowing effect when active
  const toolBtnClass = (tool: string): string => {
    const colors = toolColors[tool as keyof typeof toolColors];
    
    return `${baseBtn} ${
      isActiveTool(tool)
        ? `bg-gray-800 border border-gray-700 ${colors.text} shadow-lg ${colors.glow}`
        : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600/50'
    }`;
  };

  // Styles for shape option buttons
  const shapeOptionBtnClass = (isActive: boolean, color: string): string =>
    `px-2 py-1 text-sm rounded-md font-medium transition-all duration-300 flex items-center justify-center w-8 h-8 ${
      isActive
        ? `bg-gray-700 border border-${color}-500/50 text-${color}-400 shadow-sm shadow-${color}-500/20` 
        : 'bg-gray-800/80 text-gray-400 border border-gray-700 hover:bg-gray-700/70'
    }`;

  // Style for action buttons
  const actionBtnClass = (colorClass: string): string =>
    `${baseBtn} bg-gray-800/80 border border-gray-700 ${colorClass} hover:bg-gray-700 transition-all duration-300`;

  return (
    <div className="p-4 mt-6 rounded-xl relative flex flex-col gap-4 justify-center w-[95%] max-w-5xl overflow-hidden backdrop-blur-sm">
      {/* Background with cyber-anime aesthetic */}
      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(75,85,99,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(75,85,99,0.1)_1px,transparent_1px)] bg-[size:14px_14px]"></div>
        
        {/* Glow effect at the top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70"></div>
        
        {/* Accent corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-transparent"></div>
      </div>
      
      {/* Animation for active tool selection */}
      {isAnimating && (
        <div 
          className="fixed w-20 h-20 rounded-full pointer-events-none mix-blend-screen blur-xl bg-cyan-400 opacity-50 animate-ping z-0"
          style={{ 
            left: animPosition.x, 
            top: animPosition.y,
            transform: 'translate(-50%, -50%)' 
          }}
        ></div>
      )}

      {/* Row 1: Tool Selection Buttons */}
      <div className="relative z-10 flex flex-wrap gap-2 justify-center">
        <button onClick={(e) => selectTool('pencil', e)} className={toolBtnClass('pencil')} aria-pressed={isActiveTool('pencil')} title="Pencil Tool">
          <span className="text-lg">✏️</span> Pencil
          {isActiveTool('pencil') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"></span>}
        </button>
        
        <button onClick={(e) => selectTool('eraser', e)} className={toolBtnClass('eraser')} aria-pressed={isActiveTool('eraser')} title="Eraser Tool">
          <span className="text-lg">🧽</span> Eraser
          {isActiveTool('eraser') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-400 to-slate-600"></span>}
        </button>
        
        <button onClick={(e) => selectTool('shape', e)} className={toolBtnClass('shape')} aria-pressed={isActiveTool('shape')} title="Shape Tool">
          <span className="text-lg">□</span> Shape
          {isActiveTool('shape') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-teal-500"></span>}
        </button>
        
        <button onClick={(e) => selectTool('line', e)} className={toolBtnClass('line')} aria-pressed={isActiveTool('line')} title="Line Tool">
          <span className="text-lg">∕</span> Line
          {isActiveTool('line') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500"></span>}
        </button>
        
        <button onClick={(e) => selectTool('text', e)} className={toolBtnClass('text')} aria-pressed={isActiveTool('text')} title="Text Tool">
          <span className="text-lg">📝</span> Text
          {isActiveTool('text') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500"></span>}
        </button>
        
        <button onClick={(e) => selectTool('fill', e)} className={toolBtnClass('fill')} aria-pressed={isActiveTool('fill')} title="Fill Tool (Bucket)">
          <span className="text-lg">🪣</span> Fill
          {isActiveTool('fill') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"></span>}
        </button>
        
        <button onClick={(e) => selectTool('emoji', e)} className={toolBtnClass('emoji')} aria-pressed={isActiveTool('emoji')} title="Emoji Tool">
          <span className="text-lg">😊</span> Emoji
          {isActiveTool('emoji') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-400 to-pink-500"></span>}
        </button>
        
        <button onClick={(e) => selectTool('spray', e)} className={toolBtnClass('spray')} aria-pressed={isActiveTool('spray')} title="Spray Tool">
          <span className="text-lg">💦</span> Spray
          {isActiveTool('spray') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-500"></span>}
        </button>
        
        <button onClick={(e) => selectTool('ai', e)} className={toolBtnClass('ai')} aria-pressed={isActiveTool('ai')} title="AI Magic Tool">
          <span className="text-lg">✨</span> AI
          {isActiveTool('ai') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-600"></span>}
        </button>
      </div>

      {/* Row 2: Conditional Sub-Toolbars */}
      {selectedTool === 'shape' && (
        <div className="relative z-10 flex flex-wrap gap-3 items-center justify-center p-3 rounded-lg mx-auto max-w-md bg-gray-800/60 backdrop-blur-sm border border-gray-700/50">
          <span className="font-medium text-sm text-green-400">Shape Options:</span>
          {/* Shape Type Selection */}
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedShape('rectangle')} 
              className={shapeOptionBtnClass(selectedShape === 'rectangle', 'green')} 
              title="Rectangle"
            >
              ▭
            </button>
            <button 
              onClick={() => setSelectedShape('circle')} 
              className={shapeOptionBtnClass(selectedShape === 'circle', 'green')} 
              title="Circle/Ellipse"
            >
              ⚪
            </button>
          </div>
          {/* Fill/Stroke Checkboxes */}
          <div className="flex items-center gap-3 ml-2">
            <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed" title={selectedShape === 'line' ? 'Fill not applicable to lines' : 'Fill the shape'}>
              <div className="relative flex items-center justify-center h-5 w-5">
                <input
                  type="checkbox"
                  checked={shapeFill}
                  onChange={(e) => setShapeFill(e.target.checked)}
                  disabled={selectedShape === 'line'}
                  className="peer sr-only"
                />
                <div className="absolute inset-0 border border-gray-600 rounded-md bg-gray-900/90 transition-all peer-checked:border-green-500"></div>
                <div className="opacity-0 peer-checked:opacity-100 text-green-500 transition-opacity">✓</div>
              </div>
              Fill
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer" title="Draw the shape outline">
              <div className="relative flex items-center justify-center h-5 w-5">
                <input
                  type="checkbox"
                  checked={shapeStroke}
                  onChange={(e) => setShapeStroke(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="absolute inset-0 border border-gray-600 rounded-md bg-gray-900/90 transition-all peer-checked:border-green-500"></div>
                <div className="opacity-0 peer-checked:opacity-100 text-green-500 transition-opacity">✓</div>
              </div>
              Stroke
            </label>
          </div>
        </div>
      )}

      {/* Row 3: Common Properties & Actions */}
      <div className="relative z-10 flex flex-wrap gap-4 items-center justify-center w-full pt-3 border-t border-gray-700/50">
        {/* Color Picker - Futuristic style */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
          <div className="relative flex items-center gap-2 p-1 bg-gray-800 rounded-lg border border-gray-700">
            <label htmlFor="colorPicker" className="sr-only">Color</label>
            <input
              id="colorPicker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-none overflow-hidden"
              aria-label="Select drawing color"
              title={`Current Color: ${color}`}
            />
            <span className="text-xs font-mono text-gray-400">{color.toUpperCase()}</span>
          </div>
        </div>

        {/* Brush/Tool Size Slider */}
        <div className="relative flex items-center gap-2 p-2 bg-gray-800/80 rounded-lg border border-gray-700">
          <label htmlFor="sizeSlider" className="font-medium text-sm text-gray-400">Size:</label>
          <div className="relative w-24">
            <input
              id="sizeSlider"
              type="range"
              min="1"
              max="100"
              step="1"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              aria-label="Select brush size"
              title={`Current Size: ${size}`}
              style={{
                background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${size}%, rgb(55, 65, 81) ${size}%, rgb(55, 65, 81) 100%)`
              }}
            />
            <div className="absolute -bottom-1 w-full flex justify-between text-[0.65rem] text-gray-500">
              <span>1</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
          <span className="text-sm font-mono text-purple-400 w-8 text-right tabular-nums">{size}</span>
        </div>

        {/* Fill Tolerance Slider (Conditional) */}
        {selectedTool === 'fill' && (
          <div className="relative flex items-center gap-2 p-2 bg-gray-800/80 rounded-lg border border-gray-700">
            <label htmlFor="fillToleranceSlider" className="font-medium text-sm text-gray-400">Tolerance:</label>
            <div className="relative w-20">
              <input
                id="fillToleranceSlider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={fillTolerance}
                onChange={(e) => setFillTolerance(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                title={`Fill Tolerance: ${fillTolerance}`}
                style={{
                  background: `linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(6, 182, 212) ${fillTolerance}%, rgb(55, 65, 81) ${fillTolerance}%, rgb(55, 65, 81) 100%)`
                }}
              />
            </div>
            <span className="text-sm font-mono text-cyan-400 w-8 text-right tabular-nums">{fillTolerance}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <button onClick={undo} className={actionBtnClass("text-sky-400")} title="Undo (Ctrl+Z)">
            <span className="text-lg">↩️</span> Undo
          </button>
          <button onClick={redo} className={actionBtnClass("text-sky-400")} title="Redo (Ctrl+Y)">
            <span className="text-lg">↪️</span> Redo
          </button>
          <button onClick={clearCanvas} className={actionBtnClass("text-rose-400")} title="Clear Canvas">
            <span className="text-lg">🗑️</span> Clear
          </button>
          <button onClick={handleDownload} className={actionBtnClass("text-green-400")} title={`Download as ${saveFormat.toUpperCase()}`}>
            <span className="text-lg">💾</span> Download
          </button>
          <button onClick={handleShare} className={actionBtnClass("text-blue-400")} title="Share Drawing">
            <span className="text-lg">🌐</span> Share
          </button>
          <button onClick={toggleCanvasSize} className={actionBtnClass("text-indigo-400")} title="Cycle Canvas Size">
            <span className="text-lg">🖼️</span> Size
          </button>
          <button onClick={cycleSaveFormat} className={actionBtnClass("text-yellow-400")} title={`Cycle Save Format (Current: ${saveFormat.toUpperCase()})`}>
            {saveFormat.toUpperCase()}
          </button>
          <button onClick={saveCanvas} className={actionBtnClass("text-gray-400")} title="Save to Browser">
            <span className="text-lg">💿</span> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;