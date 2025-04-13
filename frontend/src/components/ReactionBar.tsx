import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded list of reactions with more visual flair
const reactions = [
  "this SLAPS 🔥",
  "lowkey a masterpiece 💫",
  "is that AI? no, it's you 👀",
  "I felt that 🎯",
  "better than Picasso ngl 🧠",
  "ok Doodle Da Vinci 🎨",
  "vibes unmatched 💅✨",
  "this doodle's got lore 🧚",
  "I'm saving this 🫶",
  "straight heat 🔥🔥🔥",
  "creativity off the charts 🚀",
  "10/10 would doodle again ⭐",
  "making magic happen 🪄",
];

// Add emojis for particle effects
const emojis = ['✨', '🔥', '💫', '⭐', '💅', '🎨', '🚀', '🪄'];

// Define particle type
interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

const ReactionBar: React.FC = () => {
  // State to hold the currently displayed reaction string
  const [currentReaction, setCurrentReaction] = useState(reactions[0]);
  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);
  // State for tracking clicks to show interactive feedback
  const [clickCount, setClickCount] = useState(0);
  // State for particles
  const [particles, setParticles] = useState<Particle[]>([]);

  // Function to handle reaction bar click
  const handleClick = () => {
    // Increment counter to track engagement
    setClickCount(prev => prev + 1);
    
    // Create particle burst effect
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: 50 - Math.random() * 100,  // Random position
        y: 50 - Math.random() * 100,  // Random position
      });
    }
    setParticles([...particles, ...newParticles]);
    
    // Clear particles after animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticles[0].id));
    }, 1000);
    
    // Manually trigger a reaction change on click
    let nextReaction = currentReaction;
    while (nextReaction === currentReaction) {
      nextReaction = reactions[Math.floor(Math.random() * reactions.length)];
    }
    setCurrentReaction(nextReaction);
  };

  useEffect(() => {
    // Set up an interval to change the reaction periodically
    const intervalId = setInterval(() => {
      let nextReaction = currentReaction;
      // Ensure the next reaction is different from the current one (if possible)
      if (reactions.length > 1) {
        while (nextReaction === currentReaction) {
          nextReaction = reactions[Math.floor(Math.random() * reactions.length)];
        }
      }
      // Update the state to trigger the change
      setCurrentReaction(nextReaction);
    }, 3500); // Change every 3.5 seconds

    // Cleanup function: clear the interval when the component unmounts
    return () => clearInterval(intervalId);
    // Dependency array ensures effect cleanup/re-run logic is correct
  }, [currentReaction]);

  return (
    // Outer container for centering
    <div className="flex justify-center my-8 md:my-12 px-4 relative">
      {/* Ambient glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-400/20 blur-xl opacity-50"></div>
      
      {/* Particles container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute left-1/2 top-1/2 text-lg"
            initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
            animate={{ 
              x: particle.x, 
              y: particle.y, 
              scale: 1.5, 
              opacity: 0 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </div>
      
      {/* Interactive container - now rectangular */}
      <motion.div
        className={`
          relative px-8 py-4 rounded-md text-sm md:text-base font-medium
          bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500
          text-white shadow-lg overflow-hidden
          border border-white/30 backdrop-blur-sm
          flex items-center justify-center min-w-64 h-14
          cursor-pointer select-none
        `}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ 
          scale: 1.03, 
          boxShadow: "0 0 25px rgba(236, 72, 153, 0.6)" 
        }}
        whileTap={{ scale: 0.98 }}
        animate={{
          backgroundPosition: isHovered ? ["0% 50%", "100% 50%"] : "0% 50%",
        }}
        transition={{
          backgroundPosition: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-orange-400/20 opacity-50"></div>
        
        {/* Geometric accent elements for rectangle design */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-300/80 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-orange-300/80 to-transparent"></div>
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-300/80 to-transparent"></div>
        <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent to-orange-300/80"></div>
        
        {/* Inner decorative lines */}
        <div className="absolute top-2 left-2 right-2 h-px bg-white/20"></div>
        <div className="absolute bottom-2 left-2 right-2 h-px bg-white/20"></div>
        
        {/* Pulse effect on interaction */}
        <AnimatePresence>
          {clickCount > 0 && (
            <motion.div
              key="pulse"
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.7, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            ></motion.div>
          )}
        </AnimatePresence>
        
        {/* AnimatePresence handles the enter/exit animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReaction}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-10 flex items-center gap-2 px-2"
          >
            {/* Left sparkle with subtle animation */}
            <motion.span 
              className="text-white/90"
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              ✨
            </motion.span>
            
            {/* Main text */}
            <span className="whitespace-nowrap font-medium tracking-wide">
              {currentReaction}
            </span>
            
            {/* Right sparkle with different animation */}
            <motion.span
              className="text-white/90"
              animate={{ 
                rotate: [0, -15, 15, 0],
                scale: [1, 0.9, 1.2, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              ✨
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ReactionBar;