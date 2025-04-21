import { FC, useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Code, Key, ChevronDown, ChevronUp, MessageSquare, Zap, X, Clock, Bot, ArrowRight, Sparkles, Github } from 'lucide-react';

// Define types for security metrics
interface SecurityMetric {
  category: string;
  score: number; // 0-100
  issues: number;
  description: string;
  icon: JSX.Element;
}

interface SecurityVulnerability {
  type: string;
  count: number;
  color: string;
}

interface InstanceSecurityCheckProps {
  containerName?: string;
}

interface AIRecommendation {
  id: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  codeSnippet?: string;
  status: 'pending' | 'in-progress' | 'resolved';
  autoFixAvailable: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
  deployable?: boolean; // Flag to indicate if this message contains deployable code
}

const InstanceSecurityCheck: FC<InstanceSecurityCheckProps> = ({ containerName = 'Unknown' }) => {
  // This would normally come from an API, but we're using mock data for the landing page
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([
    {
      category: 'Code Quality',
      score: 78,
      issues: 12,
      description: 'Some minor code quality issues detected',
      icon: <Code className="text-primary" size={20} />
    },
    {
      category: 'Hardcoded Values',
      score: 45,
      issues: 23,
      description: 'Multiple hardcoded credentials found',
      icon: <Key className="text-chart-1" size={20} />
    },
    {
      category: 'Dependency Security',
      score: 92,
      issues: 3,
      description: 'Few outdated dependencies with vulnerabilities',
      icon: <Lock className="text-chart-2" size={20} />
    }
  ]);

  const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>([
    { type: 'Critical', count: 2, color: '#ef4444' },
    { type: 'High', count: 8, color: '#f97316' },
    { type: 'Medium', count: 15, color: '#eab308' },
    { type: 'Low', count: 12, color: '#22c55e' }
  ]);

  // State for expand/collapse functionality
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Agentic AI states
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([
    {
      id: 'rec1',
      issue: 'Hardcoded API keys detected in multiple files',
      severity: 'critical',
      recommendation: 'Move API keys to environment variables or a secure vault',
      codeSnippet: 'const apiKey = "sk_test_51NcDR6SIf...";',
      status: 'pending',
      autoFixAvailable: true
    },
    {
      id: 'rec2',
      issue: 'Outdated npm packages with known vulnerabilities',
      severity: 'high',
      recommendation: 'Update dependencies to latest secure versions',
      codeSnippet: '"react-dom": "16.8.0", "axios": "0.21.1"',
      status: 'in-progress',
      autoFixAvailable: true
    },
    {
      id: 'rec3',
      issue: 'Missing input validation on user forms',
      severity: 'medium',
      recommendation: 'Implement client and server-side validation',
      status: 'pending',
      autoFixAvailable: false
    }
  ]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg1',
      sender: 'ai',
      message: 'Hello! I\'ve analyzed your codebase and found several security issues. How can I help you resolve them?',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [showGithubDeploy, setShowGithubDeploy] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  // Simulate AI response
  const sendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // Add user message
    const newUserMessage: ChatMessage = {
      id: `msg${chatMessages.length + 1}`,
      sender: 'user',
      message: inputMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsAgentThinking(true);
    
    // Simulate AI thinking and then responding
    setTimeout(() => {
      const aiResponses = [
        "I can help fix that issue. Would you like me to generate a PR with the necessary changes?",
        "Let me analyze this further. The problem seems to be with your authentication flow. I recommend implementing token rotation.",
        "I've identified the root cause. You're using an outdated encryption method that's vulnerable to attacks.",
        "Based on your codebase, I suggest migrating these hardcoded values to environment variables. Should I prepare the changes for you?"
      ];
      
      const isDeployableResponse = Math.random() > 0.5; // Randomly decide if this response has deployable code
      
      const newAiMessage: ChatMessage = {
        id: `msg${chatMessages.length + 2}`,
        sender: 'ai',
        message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
        deployable: isDeployableResponse
      };
      
      setChatMessages(prev => [...prev, newAiMessage]);
      setIsAgentThinking(false);
      
      // If this is a response that can be deployed, show GitHub deploy option
      if (isDeployableResponse) {
        setShowGithubDeploy(true);
      }
    }, 1500);
  };
  
  // Handle auto-fix for an issue
  const handleAutoFix = (id: string) => {
    setAiRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: 'in-progress' } 
          : rec
      )
    );
    
    // Simulate fixing process
    setTimeout(() => {
      setAiRecommendations(prev => 
        prev.map(rec => 
          rec.id === id 
            ? { ...rec, status: 'resolved' } 
            : rec
        )
      );
      
      // Add AI message about the fix
      const newAiMessage: ChatMessage = {
        id: `msg${chatMessages.length + 1}`,
        sender: 'ai',
        message: `I've automatically fixed the issue: "${aiRecommendations.find(r => r.id === id)?.issue}". Would you like to review the changes?`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newAiMessage]);
    }, 2000);
  };
  
  // Toggle chat for a specific issue
  const toggleChatForIssue = (id: string) => {
    setSelectedIssue(id);
    setShowChatInterface(true);
    
    // Add context-specific message if this is a new conversation about this issue
    if (!chatMessages.some(msg => msg.message.includes(id))) {
      const issue = aiRecommendations.find(r => r.id === id);
      
      const newAiMessage: ChatMessage = {
        id: `msg${chatMessages.length + 1}`,
        sender: 'ai',
        message: `Let's discuss the "${issue?.issue}" issue. My recommendation is to ${issue?.recommendation.toLowerCase()}. Would you like me to help implement this solution?`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newAiMessage]);
    }
  };

  // Calculate overall security score (weighted average)
  const overallScore = Math.round(
    securityMetrics.reduce((acc, metric) => acc + metric.score, 0) / securityMetrics.length
  );

  // Determine overall status color
  const getStatusColor = (score: number) => {
    if (score >= 80) return 'bg-chart-2';
    if (score >= 60) return 'bg-chart-1';
    return 'bg-destructive';
  };

  // Get text color based on score
  const getTextColor = (score: number) => {
    if (score >= 80) return 'text-chart-2';
    if (score >= 60) return 'text-chart-1';
    return 'text-destructive';
  };

  // Calculate total vulnerabilities
  const totalVulnerabilities = vulnerabilities.reduce((acc, vuln) => acc + vuln.count, 0);

  return (
    <div className="bg-card rounded-lg shadow-md p-6 w-full relative transition-all duration-300 overflow-hidden" 
         style={{ maxHeight: isExpanded ? '1000px' : '400px' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className={`${getTextColor(overallScore)}`} size={24} />
          <h3 className="text-xl font-semibold">Security Assessment</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowChatInterface(!showChatInterface)} 
            className="p-2 rounded-full text-white bg-primary hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            aria-label="AI Assistant"
            title="AI Security Assistant"
          >
            <Bot size={16} />
            <span className="text-xs font-medium">AI Assistant</span>
          </button>
          <span className="text-sm text-muted-foreground">Last scan: Today</span>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="mb-6 border border-primary/10 rounded-lg p-3 bg-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={18} />
            <h4 className="text-sm font-semibold text-grey">AI Recommendations</h4>
          </div>
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
            {aiRecommendations.filter(r => r.status === 'pending').length} pending
          </span>
        </div>
        
        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
          {aiRecommendations.map((rec) => (
            <div 
              key={rec.id} 
              className={`p-2 rounded-lg border ${
                rec.status === 'resolved' 
                  ? 'border-chart-2/20 bg-chart-2/5' 
                  : rec.severity === 'critical' 
                    ? 'border-destructive/20 bg-destructive/5'
                    : rec.severity === 'high'
                      ? 'border-chart-1/20 bg-chart-1/5'
                      : 'border-chart-4/20 bg-chart-4/5'
              } animate-fade-in`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1">
                  {rec.status === 'resolved' ? (
                    <CheckCircle size={16} className="text-chart-2" />
                  ) : rec.severity === 'critical' ? (
                    <AlertTriangle size={16} className="text-destructive animate-pulse-once" />
                  ) : (
                    <AlertTriangle size={16} className="text-chart-1" />
                  )}
                  <span className="text-xs font-medium truncate">{rec.issue}</span>
                </div>
                <div className="flex gap-1">
                  {rec.status !== 'resolved' && rec.autoFixAvailable && (
                    <button
                      onClick={() => handleAutoFix(rec.id)}
                      className="text-xs bg-primary text-white px-2 py-0.5 rounded flex items-center gap-0.5 hover:bg-primary/90"
                      title="Auto-fix this issue"
                    >
                      <Zap size={12} />
                      Fix
                    </button>
                  )}
                  <button
                    onClick={() => toggleChatForIssue(rec.id)}
                    className="text-xs bg-button-secondary hover:bg-muted px-2 py-0.5 rounded flex items-center gap-0.5"
                    title="Discuss this issue with AI"
                  >
                    <MessageSquare size={12} />
                    Chat
                  </button>
                </div>
              </div>
              {rec.codeSnippet && (
                <div className="mt-1 text-xs bg-grey text-white p-1.5 rounded font-mono">
                  {rec.codeSnippet}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overall Security Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-grey">Overall Security Score</span>
          <span className={`font-bold text-lg ${getTextColor(overallScore)}`}>{overallScore}/100</span>
        </div>
        
        {/* Red to Green Horizontal Bar */}
        <div className="h-4 w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative">
          {/* Indicator */}
          <div 
            className="absolute top-0 w-4 h-6 -mt-1 transform -translate-x-1/2 transition-all duration-500"
            style={{ left: `${overallScore}%` }}
          >
            <div className="w-4 h-4 bg-white rounded-full border-2 border-grey shadow-md"></div>
          </div>
        </div>
        
        <div className="flex justify-between mt-1 text-xs text-grey">
          <span>Critical</span>
          <span>Moderate</span>
          <span>Secure</span>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-semibold text-grey">Security Metrics</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {securityMetrics.map((metric, index) => (
            <div key={index} className="bg-grey-50 p-3 rounded-lg flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="font-medium">{metric.category}</span>
                </div>
                <span className={`font-semibold ${getTextColor(metric.score)}`}>{metric.score}/100</span>
              </div>
              
              {/* Small Pie Chart */}
              <div className="relative w-16 h-16 mb-2">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  {/* Background circle */}
                  <circle cx="18" cy="18" r="15.91549430918954" fill="#f3f4f6" strokeWidth="0"></circle>
                  
                  {/* Score segment */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.91549430918954" 
                    fill="transparent"
                    stroke={metric.score >= 80 ? '#22c55e' : (metric.score >= 60 ? '#eab308' : '#ef4444')}
                    strokeWidth="5"
                    strokeDasharray={`${metric.score} ${100 - metric.score}`}
                    strokeDashoffset="25"
                    strokeLinecap="round"
                  />
                  
                  {/* Center circle for donut effect */}
                  <circle cx="18" cy="18" r="12" fill="white"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">{metric.issues}</span>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-xs text-grey">{metric.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerability Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-grey mb-4">Vulnerability Distribution</h4>
        
        <div className="flex items-center">
          {/* Pie Chart Visualization */}
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="3"></circle>
              
              {/* Dynamic pie chart segments */}
              {(() => {
                let startAngle = 0;
                return vulnerabilities.map((vuln, index) => {
                  const percentage = (vuln.count / totalVulnerabilities) * 100;
                  const angle = (percentage / 100) * 360;
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  // Calculate start and end points
                  const x1 = 18 + 15.91549430918954 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 18 + 15.91549430918954 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 18 + 15.91549430918954 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
                  const y2 = 18 + 15.91549430918954 * Math.sin((startAngle + angle - 90) * Math.PI / 180);
                  
                  const pathData = `M 18 18 L ${x1} ${y1} A 15.91549430918954 15.91549430918954 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                  
                  const path = <path key={index} d={pathData} fill={vuln.color}></path>;
                  
                  startAngle += angle;
                  return path;
                });
              })()}
              
              {/* Center circle for donut effect */}
              <circle cx="18" cy="18" r="10" fill="white"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{totalVulnerabilities}</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="ml-6 flex-1 grid grid-cols-2 gap-2">
            {vulnerabilities.map((vuln, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vuln.color }}></div>
                <span className="text-xs text-grey">{vuln.type} ({vuln.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          Run Full Scan
        </button>
        <button className="px-4 py-2 bg-grey-100 text-grey rounded-md text-sm font-medium hover:bg-grey-200 transition-colors">
          View Details
        </button>
      </div>
      
      {/* Gradient overlay for collapsed state */}
      {!isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
      )}
      
      {/* Expand/collapse button at bottom center when collapsed */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs font-medium text-grey hover:bg-muted/80 transition-colors z-10 animate-bounce-subtle"
        >
          Show more <ChevronDown size={14} />
        </button>
      )}
      
      {/* AI Chat Interface */}
      {showChatInterface && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-card rounded-lg shadow-xl flex flex-col z-50 border border-border animate-spring-in">
          {/* Chat Header */}
          <div className="bg-primary text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <h3 className="font-semibold text-sm">Security AI Assistant</h3>
              {selectedIssue && (
                <span className="bg-primary/80 px-1.5 py-0.5 rounded text-xs">
                  Issue #{selectedIssue.replace('rec', '')}
                </span>
              )}
            </div>
            <button 
              onClick={() => setShowChatInterface(false)}
              className="hover:bg-primary/80 p-1 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 bg-background overflow-y-auto p-3 space-y-3">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}
              >
                <div 
                  className={`max-w-[75%] p-3 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-grey'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs opacity-70">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    {msg.sender === 'ai' && msg.deployable && (
                      <button 
                        onClick={() => setShowGithubDeploy(true)}
                        className="text-xs flex items-center gap-0.5 text-white bg-[#2da44e] hover:bg-[#2c974b] px-2 py-0.5 rounded"
                        title="Deploy this fix to GitHub"
                      >
                        <Github size={12} />
                        <span>Deploy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isAgentThinking && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted text-grey p-3 rounded-lg max-w-[75%]">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Security AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="p-3 border-t border-border">
            {showGithubDeploy && (
              <div className="mb-3 p-3 bg-[#f6f8fa] border border-[#d0d7de] rounded-md animate-slide-in-up">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-[#24292f] flex items-center gap-1.5">
                    <Github size={14} className="text-[#24292f]" />
                    Deploy Changes to GitHub
                  </h4>
                  <button 
                    onClick={() => setShowGithubDeploy(false)}
                    className="text-[#57606a] hover:text-[#24292f]"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-[#57606a]">
                  <p className="mb-2">Ready to deploy security fixes for:</p>
                  <div className="bg-[#eaeef2] p-2 rounded font-mono mb-2 text-[#24292f]">
                    {selectedIssue 
                      ? aiRecommendations.find(r => r.id === selectedIssue)?.issue 
                      : 'Multiple hardcoded API credentials issues'}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        setDeployLoading(true);
                        // Simulate GitHub deployment
                        setTimeout(() => {
                          setDeployLoading(false);
                          setShowGithubDeploy(false);
                          
                          // Add success message from AI
                          const newAiMessage: ChatMessage = {
                            id: `msg${chatMessages.length + 1}`,
                            sender: 'ai',
                            message: "🎉 Successfully created PR #143 with security fixes. View it at github.com/user/repo/pull/143",
                            timestamp: new Date()
                          };
                          
                          setChatMessages(prev => [...prev, newAiMessage]);
                          
                          // Mark the issue as resolved if we're addressing a specific issue
                          if (selectedIssue) {
                            setAiRecommendations(prev => 
                              prev.map(rec => 
                                rec.id === selectedIssue 
                                  ? { ...rec, status: 'resolved' } 
                                  : rec
                              )
                            );
                          }
                        }, 2000);
                      }}
                      disabled={deployLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 ${
                        deployLoading 
                          ? 'bg-[#6e7781] cursor-not-allowed' 
                          : 'bg-[#2da44e] hover:bg-[#2c974b]'
                      } text-white rounded-md text-xs font-medium transition-colors`}
                    >
                      {deployLoading ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Creating PR...</span>
                        </>
                      ) : (
                        <>
                          <Github size={12} />
                          <span>Create Pull Request</span>
                        </>
                      )}
                    </button>
                    <select 
                      className="text-xs border border-[#d0d7de] rounded px-2 py-1.5 bg-white text-[#24292f]"
                      disabled={deployLoading}
                    >
                      <option value="main">main</option>
                      <option value="develop">develop</option>
                      <option value="new-branch">Create new branch</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about security issues..."
                className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={inputMessage.trim() === ''}
                className="bg-primary text-white p-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary" />
              <span>AI can analyze code, suggest fixes, and generate PRs for you</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstanceSecurityCheck;