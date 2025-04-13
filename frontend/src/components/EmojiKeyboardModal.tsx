// src/components/EmojiKeyboardModal.tsx
import React from 'react';

interface EmojiKeyboardModalProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔',
  // Add more as desired…
];

const EmojiKeyboardModal: React.FC<EmojiKeyboardModalProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-xl p-4 z-10 w-11/12 max-w-md">
        <h3 className="text-xl font-bold mb-4 text-center text-pink-500">
          Select an Emoji
        </h3>
        <div className="grid grid-cols-6 gap-3">
          {emojiList.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="text-2xl hover:scale-110 transition transform"
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 block mx-auto px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EmojiKeyboardModal;
