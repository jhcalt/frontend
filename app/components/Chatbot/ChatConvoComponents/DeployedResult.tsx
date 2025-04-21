import React, { useState } from 'react';
import { Link, Server, Upload, Check, Copy, ExternalLink } from 'lucide-react';

interface DeployedResultProps {
  ipLink: string;
  host: string;
}

const DeployedResult: React.FC<DeployedResultProps> = ({ ipLink, host }) => {
  const [envVariables, setEnvVariables] = useState<{ [key: string]: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.env')) {
        processFile(file);
      }
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const parsedVariables = parseEnvFile(text);
      setEnvVariables(parsedVariables);
      setFileUploaded(true);
    };
    reader.readAsText(file);
  };

  const parseEnvFile = (text: string): { [key: string]: string } => {
    const variables: { [key: string]: string } = {};
    const lines = text.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        const value = match[2] || '';
        variables[key] = value;
      }
    }
    return variables;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow animate-yellow-glow max-w-xl">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-grey font-tiempos">Deployment Ready</span>
        </div>
        <span className="px-2 py-0.5 text-xs rounded-full bg-[#22c55e] text-white">Active</span>
      </div>
      
      {/* Connection details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-grey">
            <Link className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <span className="text-xs font-tiempos font-medium">IP Link</span>
          </div>
          <div className="flex items-center">
            <a
              href={ipLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors mr-1.5"
            >
              {ipLink}
            </a>
            <button 
              onClick={() => copyToClipboard(ipLink)}
              className="text-muted-foreground hover:text-grey transition-colors p-1"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <a 
              href={ipLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-grey transition-colors p-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-grey">
            <Server className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <span className="text-xs font-tiempos font-medium">Host</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1.5">{host}</span>
            <button 
              onClick={() => copyToClipboard(host)}
              className="text-muted-foreground hover:text-grey transition-colors p-1"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Environment variables section */}
      <div>
        <span className="text-xs font-tiempos font-medium text-grey block mb-2">Environment Variables</span>
        
        {fileUploaded ? (
          <div className="flex items-center text-green-600 text-xs p-2 bg-green-50 rounded">
            <Check className="w-3.5 h-3.5 mr-1.5" />
            <span>.env file uploaded</span>
          </div>
        ) : (
          <div
            className={`border border-dashed rounded p-3 ${isDragging ? 'border-primary bg-primary/5' : 'border-input'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label htmlFor="env-file" className="flex flex-col items-center cursor-pointer">
              <Upload className="w-4 h-4 text-muted-foreground mb-1" />
              <input 
                id="env-file"
                type="file" 
                accept=".env" 
                onChange={handleFileUpload}
                className="hidden" 
              />
              <span className="text-xs text-center text-muted-foreground">Drop your .env file here or <span className="text-primary hover:underline">browse</span></span>
            </label>
          </div>
        )}
        
        {/* Only show variables if we have any */}
        {Object.keys(envVariables).length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-grey font-tiempos font-medium mb-1 flex items-center justify-between">
              <span>Parsed Variables</span>
              <span className="text-muted-foreground">
                {Object.keys(envVariables).length} entries
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto pr-1">
              {Object.entries(envVariables).slice(0, 3).map(([key, value]) => (
                <div 
                  key={key} 
                  className="bg-background rounded p-1.5 border border-border/50 mb-1 text-xs"
                >
                  <p className="font-tiempos font-medium text-grey">{key}</p>
                  <p className="text-muted-foreground font-mono truncate">{value}</p>
                </div>
              ))}
              {Object.keys(envVariables).length > 3 && (
                <div className="text-xs text-center text-primary mt-1 cursor-pointer hover:underline">
                  Show {Object.keys(envVariables).length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeployedResult;