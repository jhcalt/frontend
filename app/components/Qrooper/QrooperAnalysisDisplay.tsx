import React, { useState, useEffect } from 'react';
import { Loader2, Search, CheckCircle, Info } from 'lucide-react';

interface QrooperAnalysisDisplayProps {
  onComplete?: () => void;
  repoName?: string;
}

type AnalysisStatus = 'analyzing' | 'processing' | 'completed';

const QrooperAnalysisDisplay: React.FC<QrooperAnalysisDisplayProps> = ({ onComplete, repoName = 'Repository' }) => {
  const [status, setStatus] = useState<AnalysisStatus>('analyzing');
  const [progress, setProgress] = useState<number>(0);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const statusConfig = {
    analyzing: {
      text: 'Analyzing the repo',
      color: 'purple',
      bgColor: 'bg-purple',
      textColor: 'text-purple',
      glowClass: 'animate-purple-glow-sm',
      icon: <Search size={18} className="animate-pulse" />
    },
    processing: {
      text: 'Processing the repo',
      color: 'purple',
      bgColor: 'bg-purple',
      textColor: 'text-purple',
      glowClass: 'animate-purple-glow-sm',
      icon: <Loader2 size={18} className="animate-spin" />
    },
    completed: {
      text: 'Analysis complete',
      color: 'sulu',
      bgColor: 'bg-sulu',
      textColor: 'text-sulu',
      glowClass: 'animate-sulu-glow-sm',
      icon: <CheckCircle size={18} className="text-green-500" />
    }
  };

  const current = statusConfig[status];

  useEffect(() => {
    const stages = [
      { status: 'analyzing', targetProgress: 40, duration: 2000 },
      { status: 'processing', targetProgress: 80, duration: 2000 },
      { status: 'completed', targetProgress: 100, duration: 1000 }
    ];
    
    let currentStageIndex = 0;
    const processStage = () => {
      if (currentStageIndex >= stages.length) {
        if (onComplete) {
          onComplete();
        }
        // Dispatch event when analysis is complete
        const event = new CustomEvent('qrooperAnalysisComplete');
        window.dispatchEvent(event);
        return;
      }

      const currentStage = stages[currentStageIndex];
      setStatus(currentStage.status as AnalysisStatus);

      const startProgress = currentStageIndex === 0 ? 0 : stages[currentStageIndex - 1].targetProgress;
      const increment = (currentStage.targetProgress - startProgress) / (currentStage.duration / 100);
      let currentProgress = startProgress;

      const progressInterval = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= currentStage.targetProgress) {
          clearInterval(progressInterval);
          currentStageIndex++;
          processStage();
        } else {
          setProgress(Math.round(currentProgress));
        }
      }, 100);

      return () => clearInterval(progressInterval);
    };

    processStage();
  }, [onComplete]);

  return (
    <div className={`w-full max-w-full mx-auto bg-card/70 backdrop-blur-sm border-[1.5px] border-muted rounded-lg ${current.glowClass} py-3 px-5`}>
      <div className="flex flex-col gap-3">
        {/* Header with repo name */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{repoName}</span>
            <button 
              onClick={() => setShowInfo(!showInfo)} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info size={16} />
            </button>
          </div>
          {status === 'completed' && (
            <div className="flex items-center gap-1">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-xs text-green-500">Ready</span>
            </div>
          )}
        </div>
        
        {/* Info panel (toggleable) */}
        {showInfo && (
          <div className="text-xs text-muted-foreground animate-fadeIn">
            <p>Qrooper is analyzing your repository structure, dependencies, and code patterns to provide intelligent assistance.</p>
          </div>
        )}
        
        <div className={`flex items-center gap-3`}>
          {/* Icon with slight background */}
          <div className={`p-1.5 rounded-full bg-background/30 ${current.textColor}`}>
            {current.icon}
          </div>
          
          {/* Status Text */}
          <span className={`text-sm font-semibold ${current.textColor} whitespace-nowrap`}>
            {current.text}
          </span>
          
          {/* Progress Bar */}
          <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden relative">
            <div 
              className={`h-full ${current.glowClass} ${current.bgColor} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer`} 
              style={{ 
                width: `${progress}%`, 
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundImage: `linear-gradient(90deg, ${current.bgColor}aa, ${current.bgColor})`
              }}
            ></div>
          </div>
          
          {/* Percentage */}
          <span className={`text-xs font-medium ${current.textColor} transition-colors duration-300`}>
            {progress}%
          </span>
          
          {/* Status Dots */}
          <div className="flex gap-2">
            {Object.keys(statusConfig).map((key) => {
              const isActive = key === status;
              const config = statusConfig[key as AnalysisStatus];
              return (
                <div 
                  key={key}
                  className={`w-2 h-2 rounded-full ${isActive ? `${config.bgColor} ${config.glowClass}` : 'bg-muted/60'}`}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrooperAnalysisDisplay;