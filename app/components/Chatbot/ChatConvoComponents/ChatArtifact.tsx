import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Maximize2, Minimize2, X, Terminal, Play } from 'lucide-react';

interface ChatArtifactProps {
  content: string;
  language?: string;
  title?: string;
  streaming?: boolean;
  streamingSpeed?: number;
}

export const ChatArtifact: React.FC<ChatArtifactProps> = ({ 
  content, 
  language = 'plaintext', 
  title,
  streaming = false,
  streamingSpeed = 10
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIndexRef = useRef(0);
  const contentRef = useRef('');

  // Effect to handle streaming of content
  useEffect(() => {
    // Reset streaming state when content changes
    streamIndexRef.current = 0;
    contentRef.current = content;
    
    if (streaming) {
      setIsStreaming(true);
      setDisplayedContent('');
      
      const streamContent = () => {
        const interval = setInterval(() => {
          if (streamIndexRef.current < contentRef.current.length) {
            setDisplayedContent(prev => prev + contentRef.current.charAt(streamIndexRef.current));
            streamIndexRef.current++;
          } else {
            clearInterval(interval);
            setIsStreaming(false);
          }
        }, streamingSpeed);
        
        return () => clearInterval(interval);
      };
      
      const cleanup = streamContent();
      return cleanup;
    } else {
      setDisplayedContent(content);
      setIsStreaming(false);
    }
  }, [content, streaming, streamingSpeed]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleTerminal = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    // If expanding from minimized state and was previously in fullscreen, exit fullscreen
    if (isMinimized && isExpanded) {
      setIsExpanded(false);
    }
  };

  // If minimized, show a small container with just the title
  if (isMinimized) {
    return (
      <div className="bg-gray-800 text-white text-sm rounded-lg shadow-lg p-2 mb-2 cursor-pointer animate-lilac-glow-sm" onClick={toggleMinimize}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            {title && <h3 className="ml-2 text-xs font-medium truncate">{title}</h3>}
          </div>
          <div className="text-xs text-gray-400">(Click to expand)</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isExpanded ? 'fixed inset-4 z-50' : 'relative'} bg-white rounded-lg shadow-lg overflow-hidden transition-all ${isStreaming ? 'animate-pulse-subtle' : 'animate-lilac-glow-sm'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center">
            {title && <h3 className="ml-4 text-sm font-medium">{title}</h3>}
            {isStreaming && (
              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTerminal}
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Toggle Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleExpand}
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title={isExpanded ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMinimize}
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Minimize"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre className={`p-4 overflow-x-auto bg-gray-900 text-white ${isExpanded ? 'h-[calc(100vh-10rem)]' : 'max-h-[400px]'}`}>
          <code className={`language-${language}`}>
            {displayedContent || `// Example code
function example() {
  console.log("Hello from the sandbox!");
  return "This is a sample code block";
}

// You can edit and run this code
example();`}
            {isStreaming && <span className="inline-block w-1 h-4 bg-white animate-blink ml-1"></span>}
          </code>
        </pre>
      </div>

      {/* Terminal */}
      {isTerminalOpen && (
        <div className="border-t border-gray-700 bg-gray-900 text-white">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
            <span className="text-sm">Terminal</span>
            <button
              onClick={() => setIsTerminalOpen(false)}
              className="p-1 hover:bg-gray-700 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="flex items-center space-x-2 text-gray-400">
              <span>$</span>
              <span className="flex-1">node example.js</span>
              <Play className="w-4 h-4" />
            </div>
            <div className="mt-2 text-green-400">
              Hello from the sandbox!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};