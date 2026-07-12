import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function MouseGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Use springs for smooth following
  const springX = useSpring(0, { stiffness: 300, damping: 20 });
  const springY = useSpring(0, { stiffness: 300, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Update spring targets
      springX.set(e.clientX);
      springY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      // Check if we are hovering over a clickable element
      if (
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.closest('button') ||
        e.target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [springX, springY]);

  // Don't render on mobile devices
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return null;
  }

  return (
    <>
      <motion.div
        className="mouse-glow-core"
        style={{
          x: springX,
          y: springY,
          scale: isHovering ? 1.5 : 1,
        }}
      />
      <div 
        className="mouse-glow-ambient"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.2 : 1})`,
        }}
      />
    </>
  );
}
