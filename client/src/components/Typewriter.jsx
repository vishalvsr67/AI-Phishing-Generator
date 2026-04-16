import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Typewriter = ({ text, delay = 10 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Re-initialize state upon receiving new text props
  useEffect(() => {
    setCurrentText('');
    setCurrentIndex(0);
  }, [text]);

  // Execute sequential character rendering
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
    >
      {currentText}
      {/* Render animated cursor during typing phase */}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{ borderRight: '2px solid #38bdf8', marginLeft: '2px' }}
        />
      )}
    </motion.div>
  );
};

export default Typewriter;