import { useState } from 'react';

const Footer = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  const footerLinks = [
    { label: "Privacy Policy", url: "#" },
    { label: "Terms of Service", url: "#" },
    { label: "Contact", url: "#" }
  ];

  return (
    <footer className="relative w-full py-8 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gray-900">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_70%)]"></div>
      </div>

      {/* Floating cyber elements */}
      <div className="absolute bottom-full left-1/4 w-2 h-10 bg-gradient-to-t from-cyan-500 to-transparent opacity-70"></div>
      <div className="absolute bottom-full left-3/4 w-2 h-16 bg-gradient-to-t from-pink-500 to-transparent opacity-70"></div>
      <div className="absolute bottom-full left-1/2 w-2 h-6 bg-gradient-to-t from-purple-500 to-transparent opacity-70"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
              © {new Date().getFullYear()} Doodlify
              <span className="ml-2 opacity-80">
                Made with <span className="inline-block animate-pulse text-pink-500">❤️</span> for creative minds.
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Created by <a 
                href="https://www.linkedin.com/in/imaryan02/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-pink-400 hover:to-purple-500 transition-all duration-300"
              >
                Aryan Gupta
              </a>
            </p>
          </div>

          <div className="flex items-center space-x-6">
            {footerLinks.map((link, index) => (
              <a 
                key={index}
                href={link.url}
                className="relative group text-sm text-gray-400 hover:text-white transition-colors duration-300"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {link.label}
                <span 
                  className={`absolute bottom-0 left-0 w-full h-px transform ${
                    hoverIndex === index ? 'scale-x-100' : 'scale-x-0'
                  } transition-transform duration-300 bg-gradient-to-r ${
                    index === 0 ? 'from-pink-500 to-purple-500' : 
                    index === 1 ? 'from-purple-500 to-indigo-500' : 
                    'from-indigo-500 to-cyan-500'
                  }`}
                ></span>
              </a>
            ))}
          </div>
        </div>

        {/* Digital motif */}
        <div className="w-full flex justify-center mt-4">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 rounded-full bg-pink-500 animate-ping delay-75"></div>
            <div className="w-1 h-1 rounded-full bg-purple-500 animate-ping delay-150"></div>
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping delay-300"></div>
            <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping delay-500"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;