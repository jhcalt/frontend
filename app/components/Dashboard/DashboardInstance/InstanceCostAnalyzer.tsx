import { FC, useState, useRef, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Clock, AlertCircle, Send, BrainCircuit, Zap, Bot, Sparkles } from 'lucide-react';

interface InstanceCostAnalyzerProps {
  containerName: string;
}

const InstanceCostAnalyzer: FC<InstanceCostAnalyzerProps> = ({ containerName }) => {
  // Hardcoded monthly cost data
  const monthlyData = [
    { name: 'Jan', cost: 120 },
    { name: 'Feb', cost: 135 },
    { name: 'Mar', cost: 148 },
    { name: 'Apr', cost: 157 },
    { name: 'May', cost: 165 },
    { name: 'Jun', cost: 170 },
    { name: 'Jul', cost: 165 },
    { name: 'Aug', cost: 180 },
    { name: 'Sep', cost: 190 },
    { name: 'Oct', cost: 205 },
    { name: 'Nov', cost: 220 },
    { name: 'Dec', cost: 240 },
  ];

  // Future predictions data (next 6 months)
  const futurePredictions = [
    { name: 'Jan', cost: 260 },
    { name: 'Feb', cost: 280 },
    { name: 'Mar', cost: 295 },
    { name: 'Apr', cost: 310 },
    { name: 'May', cost: 320 },
    { name: 'Jun', cost: 335 },
  ];

  // Cost breakdown data
  const costBreakdown = [
    { name: 'Compute', value: 45 },
    { name: 'Storage', value: 20 },
    { name: 'Network', value: 15 },
    { name: 'Database', value: 25 },
    { name: 'Misc', value: 5 },
  ];

  // Resource utilization data
  const resourceUtilization = [
    { name: 'CPU', actual: 65, allocated: 100 },
    { name: 'Memory', actual: 48, allocated: 100 },
    { name: 'Storage', actual: 72, allocated: 100 },
    { name: 'Network', actual: 35, allocated: 100 },
  ];

  // Colors for pie chart
  const COLORS = ['#254bf1', '#ff3153', '#8AE4F0', '#F0B28A', '#8AF096'];

  // Active tab state
  const [activeTab, setActiveTab] = useState<'current' | 'prediction' | 'optimization' | 'agent'>('current');

  // Savings data
  const potentialSavings = {
    monthly: 45,
    yearly: 540,
    percentage: 18,
  };

  // AI Agent state
  const [query, setQuery] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'agent', content: string}>>([
    {
      role: 'agent',
      content: `Hi there! I'm your cost optimization assistant. I can help you understand your cloud costs, identify savings opportunities, and even implement optimizations. Try asking me questions like:
      
• "Why did my costs increase last month?"
• "How can I reduce my database costs?"
• "What would happen if I switched to reserved instances?"
• "Find unusual spending patterns in my account"`
    }
  ]);
  const [insights, setInsights] = useState<Array<{title: string, description: string, impact: string, severity: 'low' | 'medium' | 'high'}>>([
    {
      title: "Underutilized resources detected",
      description: "Your CPU utilization has been below 30% for 80% of the time in the last week",
      impact: "Potential savings of $32/month by downsizing",
      severity: 'medium'
    },
    {
      title: "Cost anomaly detected",
      description: "Network costs increased by 43% compared to your usual pattern",
      impact: "Additional $18 spent in the last 3 days",
      severity: 'high'
    }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Handle agent query submission
  const handleQuerySubmit = () => {
    if (!query.trim()) return;
    
    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', content: query }]);
    setIsAgentThinking(true);
    
    // Simulate AI thinking time (would be replaced with actual API call)
    setTimeout(() => {
      // Generate a response based on the query
      let response = "";
      
      if (query.toLowerCase().includes("cost increase") || query.toLowerCase().includes("why did")) {
        response = "Based on my analysis, your costs increased primarily due to a 27% rise in storage usage and 3 new development environments that were provisioned. There was also increased traffic to your APIs which contributed about 12% to the cost increase.";
      } else if (query.toLowerCase().includes("database") || query.toLowerCase().includes("reduce")) {
        response = "To reduce your database costs, I recommend:\n\n1. Implement autoscaling during off-hours (potential 22% savings)\n2. Move infrequently accessed data to a lower-cost storage tier (15% savings)\n3. Optimize your queries to reduce computational load (8% savings)\n\nWould you like me to create an implementation plan for any of these?";
      } else if (query.toLowerCase().includes("reserved") || query.toLowerCase().includes("switch")) {
        response = "Switching to reserved instances would reduce your compute costs by approximately 40% over a 1-year term. Based on your current usage patterns, I recommend converting 75% of your instances to reserved, keeping 25% on-demand for flexibility. This would save about $130/month or $1,560/year.";
      } else if (query.toLowerCase().includes("unusual") || query.toLowerCase().includes("pattern")) {
        response = "I've detected several unusual patterns:\n\n1. Spike in egress traffic every Sunday between 2-4 AM (unusual for your workload)\n2. Database costs increased 3x during non-business hours\n3. Multiple short-lived instances being provisioned and terminated rapidly\n\nWould you like me to investigate any of these further?";
      } else {
        response = "I've analyzed your cost structure and found several optimization opportunities. Your greatest savings would come from rightsizing your over-provisioned instances and implementing auto-scaling for your non-production environments. I can also see opportunities in storage management and network traffic optimization. Which area would you like me to focus on?";
      }
      
      // Add AI response to conversation
      setConversation(prev => [...prev, { role: 'agent', content: response }]);
      setIsAgentThinking(false);
      setQuery('');
    }, 2000);
  };

  // Generate new AI insight
  const generateNewInsight = () => {
    setInsights(prev => [
      {
        title: "Idle load balancer detected",
        description: "A load balancer has been running with no backend services for 12 days",
        impact: "Wasting $6.50/month",
        severity: 'low'
      },
      ...prev
    ]);
  };

  return (
    <div className="bg-popover rounded-xl shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <DollarSign className="text-primary" size={20} />
          Cost Analysis
        </h3>
        <div className="flex space-x-1 bg-muted rounded-lg overflow-hidden">
          <button
            className={`px-3 py-1.5 text-sm font-medium ${
              activeTab === 'current' ? 'bg-primary text-white' : 'text-grey hover:bg-card-hover'
            }`}
            onClick={() => setActiveTab('current')}
          >
            Current
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium ${
              activeTab === 'prediction' ? 'bg-primary text-white' : 'text-grey hover:bg-card-hover'
            }`}
            onClick={() => setActiveTab('prediction')}
          >
            Forecast
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium ${
              activeTab === 'optimization' ? 'bg-primary text-white' : 'text-grey hover:bg-card-hover'
            }`}
            onClick={() => setActiveTab('optimization')}
          >
            Optimize
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1 ${
              activeTab === 'agent' ? 'bg-primary text-white' : 'text-grey hover:bg-card-hover'
            }`}
            onClick={() => setActiveTab('agent')}
          >
            <BrainCircuit size={14} />
            AI Advisor
          </button>
        </div>
      </div>

      {/* Current Cost Analysis */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Current Monthly Cost</p>
              <p className="text-2xl font-bold text-grey">${monthlyData[monthlyData.length - 1].cost}</p>
              <p className="text-xs text-chart-2 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" /> +8% from last month
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Projected Annual Cost</p>
              <p className="text-2xl font-bold text-grey">
                ${monthlyData.reduce((acc, item) => acc + item.cost, 0)}
              </p>
              <p className="text-xs text-primary flex items-center mt-1">
                <Clock size={12} className="mr-1" /> Based on current usage
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Cost Per Day</p>
              <p className="text-2xl font-bold text-grey">
                ${(monthlyData[monthlyData.length - 1].cost / 30).toFixed(2)}
              </p>
              <p className="text-xs text-grey flex items-center mt-1">
                <Clock size={12} className="mr-1" /> Average daily spend
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-md font-medium">Monthly Cost Trend</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#254bf1"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-md font-medium">Cost Breakdown</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-md font-medium">Resource Utilization</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resourceUtilization}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual Usage %" />
                    <Bar dataKey="allocated" fill="#e5e7eb" name="Allocated %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Analysis */}
      {activeTab === 'prediction' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Projected Cost (6 months)</p>
              <p className="text-2xl font-bold text-grey">
                ${futurePredictions.reduce((acc, item) => acc + item.cost, 0)}
              </p>
              <p className="text-xs text-chart-1 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" /> +35% expected growth
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Avg. Monthly Growth</p>
              <p className="text-2xl font-bold text-grey">6.2%</p>
              <p className="text-xs text-primary flex items-center mt-1">
                <Clock size={12} className="mr-1" /> Based on historical data
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Peak Cost Month</p>
              <p className="text-2xl font-bold text-grey">Jun ($335)</p>
              <p className="text-xs text-grey flex items-center mt-1">
                <AlertCircle size={12} className="mr-1" /> Plan for increased budget
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-md font-medium">Cost Forecast (Next 6 Months)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={futurePredictions}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[250, 350]} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Projected Cost']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#254bf1"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-md font-medium text-grey mb-2">Cost Factors Analysis</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="mr-2 mt-1 text-grey">•</div>
                <div className="text-grey">
                  <span className="font-semibold">Compute Scaling:</span> Expected 8% increase in compute costs due to increased traffic and workload demands.
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 text-grey">•</div>
                <div className="text-grey">
                  <span className="font-semibold">Storage Growth:</span> Projected 12% increase in storage requirements as database size grows.
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 text-grey">•</div>
                <div className="text-grey">
                  <span className="font-semibold">Network Traffic:</span> Anticipated 5% rise in network costs due to increased API calls and data transfers.
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Optimization Suggestions */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg flex flex-col md:flex-row justify-between items-center">
            <div>
              <h4 className="text-lg font-medium text-grey">Potential Cost Savings</h4>
              <p className="text-sm text-muted-foreground">Implement our recommendations to optimize your spending</p>
            </div>
            <div className="mt-4 md:mt-0 text-center">
              <p className="text-3xl font-bold text-chart-2">${potentialSavings.monthly}/mo</p>
              <p className="text-sm text-grey">${potentialSavings.yearly}/year ({potentialSavings.percentage}% savings)</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium text-grey">Optimization Recommendations</h4>
            
            <div className="border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-grey">Rightsizing Resources</h5>
                  <p className="text-sm text-muted-foreground mt-1">Your CPU utilization is consistently below 70%. Consider downgrading to a smaller instance type.</p>
                </div>
                <span className="bg-muted text-chart-2 text-xs font-medium px-2.5 py-0.5 rounded">Save $25/mo</span>
              </div>
              <button className="mt-3 text-sm text-primary hover:text-primary/80">Apply recommendation</button>
            </div>
            
            <div className="border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-grey">Storage Optimization</h5>
                  <p className="text-sm text-muted-foreground mt-1">Move older logs and rarely accessed data to lower-cost storage tiers.</p>
                </div>
                <span className="bg-muted text-chart-2 text-xs font-medium px-2.5 py-0.5 rounded">Save $12/mo</span>
              </div>
              <button className="mt-3 text-sm text-primary hover:text-primary/80">Apply recommendation</button>
            </div>
            
            <div className="border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-grey">Reserved Instance Purchase</h5>
                  <p className="text-sm text-muted-foreground mt-1">Commit to a 1-year reserved instance to receive significant discounts on your compute costs.</p>
                </div>
                <span className="bg-muted text-chart-2 text-xs font-medium px-2.5 py-0.5 rounded">Save $8/mo</span>
              </div>
              <button className="mt-3 text-sm text-primary hover:text-primary/80">Apply recommendation</button>
            </div>
          </div>
          
          <div className="border-t border-border pt-4">
            <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Apply All Recommendations
            </button>
          </div>
        </div>
      )}

      {/* AI Cost Agent Tab */}
      {activeTab === 'agent' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Conversation */}
            <div className="lg:col-span-2 h-[500px] flex flex-col">
              <div className="bg-muted p-4 rounded-t-lg flex items-center gap-2">
                <Bot className="text-primary" size={20} />
                <h4 className="font-medium text-grey">AI Cost Advisor</h4>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Powered by Agentic AI</span>
              </div>
              
              {/* Chat area */}
              <div className="flex-1 overflow-y-auto border border-border border-t-0 rounded-b-lg p-4 bg-white/50">
                <div className="space-y-4">
                  {conversation.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-white' 
                            : 'bg-muted text-grey'
                        }`}
                      >
                        {message.role === 'agent' && (
                          <div className="flex items-center gap-1 mb-1">
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-xs font-medium">AI Advisor</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isAgentThinking && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted text-grey">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse">Thinking</div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-grey/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-grey/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-grey/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
              
              {/* Input area */}
              <div className="mt-3 flex">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything about your costs..."
                  className="flex-1 border border-border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuerySubmit()}
                />
                <button 
                  onClick={handleQuerySubmit}
                  disabled={isAgentThinking || !query.trim()}
                  className="bg-primary text-white px-4 py-2 rounded-r-lg disabled:opacity-50 flex items-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            
            {/* Right Column - Proactive Insights */}
            <div className="h-[500px] flex flex-col">
              <div className="bg-muted p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="text-primary" size={18} />
                  <h4 className="font-medium text-grey">Proactive Insights</h4>
                </div>
                <button 
                  onClick={generateNewInsight}
                  className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  Refresh
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-border border-t-0 rounded-b-lg p-4 bg-white/50">
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                      <div className={`
                        p-3 font-medium text-sm flex items-center justify-between
                        ${insight.severity === 'high' ? 'bg-chart-1/10 text-chart-1' : 
                          insight.severity === 'medium' ? 'bg-chart-4/10 text-chart-3' :
                          'bg-chart-2/10 text-chart-2'}
                      `}>
                        {insight.title}
                        <span className={`
                          text-xs px-2 py-0.5 rounded-full
                          ${insight.severity === 'high' ? 'bg-chart-1/20' : 
                            insight.severity === 'medium' ? 'bg-chart-4/20' :
                            'bg-chart-2/20'}
                        `}>
                          {insight.severity}
                        </span>
                      </div>
                      <div className="p-3 text-sm text-grey">
                        <p>{insight.description}</p>
                        <p className="font-medium mt-2">{insight.impact}</p>
                        <div className="flex justify-between mt-3">
                          <button className="text-xs text-primary">Investigate</button>
                          <button className="text-xs text-primary">Fix automatically</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-3">
                <button className="w-full bg-muted hover:bg-card-hover text-primary font-medium py-2 px-4 rounded-lg transition-colors border border-border">
                  Configure AI Monitoring
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg bg-muted/50">
            <h4 className="text-md font-medium text-grey mb-2 flex items-center gap-2">
              <BrainCircuit className="text-primary" size={18} />
              What can your AI Cost Advisor do?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                  <Sparkles size={14} className="text-primary" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-grey">Autonomous Monitoring</h5>
                  <p className="text-xs text-muted-foreground">Continuously analyzes spending patterns to detect anomalies and wastage</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                  <Zap size={14} className="text-primary" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-grey">Intelligent Forecasting</h5>
                  <p className="text-xs text-muted-foreground">Predicts future costs based on historical patterns and planned changes</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                  <Bot size={14} className="text-primary" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-grey">Automated Optimization</h5>
                  <p className="text-xs text-muted-foreground">Can implement cost-saving measures automatically with your approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstanceCostAnalyzer;