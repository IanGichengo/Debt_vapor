// src/hooks/useAnimation.js
import { useState, useEffect, useRef } from 'react';

/**
 * Hook for staggered animations
 * @param {number} itemCount - Number of items to animate
 * @param {number} delay - Delay between items in ms
 * @returns {Array} Array of booleans indicating which items are animated
 */
export const useStaggeredAnimation = (itemCount, delay = 50) => {
  const [animatedItems, setAnimatedItems] = useState(0);
  
  useEffect(() => {
    const timers = [];
    
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setAnimatedItems(prev => Math.max(prev, i + 1));
      }, i * delay);
      timers.push(timer);
    }
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [itemCount, delay]);
  
  return Array.from({ length: itemCount }, (_, i) => i < animatedItems);
};

/**
 * Hook for spring animations
 * @param {number} targetValue - Target value to animate to
 * @param {number} stiffness - Spring stiffness (higher = faster)
 * @returns {number} Current animated value
 */
export const useSpringAnimation = (targetValue, stiffness = 0.1) => {
  const [value, setValue] = useState(targetValue);
  const animationRef = useRef();
  
  useEffect(() => {
    const animate = () => {
      setValue(prev => {
        const diff = targetValue - prev;
        if (Math.abs(diff) < 0.001) return targetValue;
        return prev + diff * stiffness;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, stiffness]);
  
  return value;
};

/**
 * Hook for hover animations with delay
 * @param {number} delay - Delay before showing hover state in ms
 * @returns {Object} { isHovered, hoverProps }
 */
export const useHoverWithDelay = (delay = 100) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef();
  
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsHovered(true), delay);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(false);
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
};

/**
 * Hook for mounting/unmounting animations
 * @param {boolean} isMounted - Whether component is mounted
 * @param {number} duration - Animation duration in ms
 * @returns {boolean} Should component render
 */
export const useMountAnimation = (isMounted, duration = 300) => {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isMounted && !shouldRender) {
      setShouldRender(true);
    } else if (!isMounted && shouldRender) {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isMounted, duration, shouldRender]);
  
  return shouldRender;
};
