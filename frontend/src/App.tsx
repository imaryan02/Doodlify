// src/App.tsx
import { useRef, useState, useEffect } from 'react';
import CanvasSection, { CanvasSectionRef } from './components/CanvasSection';
import ReactionBar from './components/ReactionBar';
import Footer from './components/Footer';

function App() {
  const canvasRef = useRef<CanvasSectionRef>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Track cursor for custom glow effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="min-h-screen w-full bg-gray-900 text-gray-100 font-inter relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Cybernetic Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,41,230,0.1)_0,transparent_70%)] opacity-40"></div>
        
        {/* Animated Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-800 opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-blue-700 opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-pink-600 opacity-10 blur-3xl animate-pulse"></div>
        
        {/* Digital Circuit Lines */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNjAgMTAgTSAxMCAwIEwgMTAgNjAgTSAwIDIwIEwgNjAgMjAgTSAyMCAwIEwgMjAgNjAgTSAwIDMwIEwgNjAgMzAgTSAzMCAwIEwgMzAgNjAgTSAwIDQwIEwgNjAgNDAgTSA0MCAwIEwgNDAgNjAgTSAwIDUwIEwgNjAgNTAgTSA1MCAwIEwgNTAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzVkMDRhOCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
      </div>

      {/* Cursor Glow Effect - follows mouse */}
      {isHovering && (
        <div 
          className="fixed w-40 h-40 rounded-full pointer-events-none mix-blend-screen blur-3xl bg-indigo-600 opacity-20 transition-all duration-300"
          style={{ 
            left: `${cursorPosition.x - 80}px`, 
            top: `${cursorPosition.y - 80}px`,
            transform: 'translate(-50%, -50%)' 
          }}
        ></div>
      )}

      {/* Header with Neon Effect */}
      <header className="w-full flex items-center justify-between px-6 py-4 relative z-10 border-b border-indigo-900/20 backdrop-blur-sm bg-gray-900/80">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 animate-text">
          Doodlify
          <span className="inline-block ml-1 text-sm text-cyan-400">✧</span>
        </h1>
        <nav className="space-x-4">
          <button className="relative overflow-hidden group px-5 py-2 rounded-xl bg-gray-800 text-gray-300 border border-indigo-900/40 text-sm font-medium">
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-cyan-400 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </button>
          <button className="relative overflow-hidden group px-5 py-2 rounded-xl text-sm font-medium">
            <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-indigo-600"></span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            <span className="relative z-10 text-white">Join Free</span>
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center mt-8 md:mt-16 px-4 relative z-10">
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400">
            Where <span className="text-pink-400">Creativity</span> Meets <span className="text-cyan-400">Chaos</span>{" "}
          </h2>
          {/* <div className="absolute -top-14 -right-12 text-5xl animate-bounce md:text-7xl">💥</div> */}
          <div className="absolute -top-6 -right-5  text-5xl animate-bounce md:-top-14 md:-right-14 md:text-7xl">
  💥
</div>

          <div className="absolute -bottom-4 -left-4 w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
          <div className="absolute -bottom-4 -right-4 w-20 h-1 bg-gradient-to-r from-purple-600 to-cyan-500"></div>
        </div>
        
        <p className="text-base md:text-lg mt-8 text-gray-400 max-w-2xl">
          A Gen-Z playground to draw, doodle, express &amp; surprise yourself
          <span className="block mt-1 text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">— no rules, just vibes.</span>
        </p>
        
        <div className="mt-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-80 transition duration-300"></div>
          <button
            onClick={() => canvasRef.current?.scrollToCanvas()}
            className="relative bg-gray-800 text-white px-8 py-3 rounded-xl shadow-lg text-lg font-semibold group-hover:bg-gray-900 transition-all duration-300"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 to-indigo-500 opacity-50 blur-lg"></span>
            <span className="absolute inset-0 w-full h-full bg-gray-800 rounded-xl"></span>
            <span className="relative flex items-center justify-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-cyan-400 transition-all duration-300">
              <span className="mr-2 text-xl">🎨</span> Start Doodling
            </span>
          </button>
        </div>
      </main>

      {/* Reaction Bar */}
      <ReactionBar />

      {/* Canvas Section */}
      <CanvasSection ref={canvasRef} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;