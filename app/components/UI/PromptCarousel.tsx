import React, { useEffect, useState } from 'react';

interface PromptCarouselProps {
  setText: (text: string) => void;
}

const PromptCarousel = ({ setText }: PromptCarouselProps) => {
  const [position, setPosition] = useState(0);
  const carouselItems = [
    { icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z", text: "Create image" },
    { text: "Deploy python project" },
    { text: "Scan my Remix App" },
    { text: "Make a plan" },
    { text: "More" },
    { text: "Data visualization" },
    { text: "Setup CI/CD pipeline" },
    { text: "Generate SVG icons" },
    { text: "Create API docs" },
    { text: "Optimize database" }
  ];

  // Clone the first few items and add to the end for seamless looping
  const extendedItems = [...carouselItems, ...carouselItems.slice(0, 4)];

  // Calculate total width
  const itemWidth = 180; // Approximate width of each button including gap
  const totalWidth = carouselItems.length * itemWidth;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prevPosition) => {
        // If we've scrolled to the cloned section, reset to start instantly (but hidden)
        if (prevPosition <= -totalWidth + 100) {
          return 0;
        }
        return prevPosition - 1; // Move by 1px each time for smooth scrolling
      });
    }, 20);

    return () => clearInterval(interval);
  }, [totalWidth]);

  return (
    <div className="w-full overflow-hidden py-4">
      <div 
        className="flex whitespace-nowrap transition-none"
        style={{ transform: `translateX(${position}px)` }}
      >
        {extendedItems.map((item, index) => (
          <button
            key={index}
            className="flex items-center text-sm space-x-2 px-4 py-2 mx-2 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors duration-200 hover:shadow-sm whitespace-nowrap"
            onClick={() => setText(item.text)}
          >
            {item.icon && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            )}
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptCarousel;
