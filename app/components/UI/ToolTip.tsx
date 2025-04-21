import React, { useState, useRef } from 'react';

export const TooltipWrapper = ({children, content = 'Coming Soon', position = 'top', delay = 100}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  
  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };
  
  const handleClick = () => {
    // Hide tooltip when the wrapped element is clicked
    setIsVisible(false);
  };
  
  // Calculate position classes based on the position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'top':
      default:
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    }
  };
  
  // Animation classes based on position
  const getAnimationClasses = () => {
    if (!isVisible) {
      return 'opacity-0 scale-95';
    }
    
    return 'opacity-100 scale-100';
  };
  
  // Clone children and add onClick handler
  const childrenWithProps = React.Children.map(children, child => {
    // Check if the child is a valid React element
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: (e) => {
          // Call the original onClick if it exists
          if (child.props.onClick) {
            child.props.onClick(e);
          }
          handleClick();
        }
      });
    }
    return child;
  });
  
  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {childrenWithProps}
      
      <div 
        className={`
          absolute z-50 ${getPositionClasses()} 
          ${getAnimationClasses()}
          transform transition-all duration-200 ease-in-out
          min-w-max pointer-events-none
          font-future
          text-gray-600
        `}
        style={{ 
          visibility: isVisible ? 'visible' : 'hidden',
          transitionProperty: 'opacity, transform, visibility'
        }}
      >
        <div 
          className={`
            rounded-md px-3 py-2 text-sm shadow-md
            bg-white
          `}
        >
          {content}
        </div>
      </div>
    </div>
  );
};