import { useRef, useEffect, useState } from 'react';
import { RepoData, UiRepo } from '~/types/github-types';
import { fetchQrooperResult } from '~/utils/llm/qrooperUtils';

interface GitHubDropdownProps {
  onGithubRepoImport: (repoName: string) => void;
  githubUsername: string;
  repoData: RepoData[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  username: string;
}

export default function GitHubRepoDropdown({ onGithubRepoImport, githubUsername, repoData, isOpen, username }: GitHubDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState<UiRepo[]>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');

  useEffect(() => {
    // console.log("REPO DATA: ", repoData)
    if (repoData && repoData.length > 0) {
      const repos = repoData.map(repo => {
        return {
          name: repo.name,
          icon: getRandomIcon(), // You can replace with actual icon logic if needed
          private: repo.visibility === 'private',
          lastUpdated: formatRelativeTime(repo.last_push)
        };
      });
      setRepositories(repos);
    }
  }, [repoData]);

  // Get random icon for demo purposes (you can replace this with actual icon logic)
  const getRandomIcon = () => {
    const icons = ['triangle', 'dots', 'circle'];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  // Format ISO date to relative time (e.g., "2h ago", "Mar 6", etc.)
  const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      if (hours < 1) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    
    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
    
    // Format as "Month Day"
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const handleRepoImport = async (repoName: string, username: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnalyzing(true);
    setSelectedRepo(repoName);
    onGithubRepoImport(repoName);

    const query = `what is this codebase all about`;
    try {
      const result = await fetchQrooperResult(query, repoName, username);
      
      if (result && result.ok) {
        // Store result data in sessionStorage
        sessionStorage.setItem('qrooperAnalysisResult', JSON.stringify(result.data));
        
        // Dispatch event with the result data
        const event = new CustomEvent('qrooperAnalysisComplete', {
          detail: result.data
        });
        window.dispatchEvent(event);
        setIsAnalyzing(false);
      } else {
        // Handle the case where the fetch was not successful
        console.error('Qrooper analysis failed:', result ? `Status: ${result.status}` : 'Unknown fetch error');
        // Optionally, inform the user about the failure here
      }
      
      // setIsOpen(false);
    } catch (error) {
      console.error('Error fetching Qrooper result:', error);
      setIsAnalyzing(false);
    }
  };

  // Filter repositories based on search query
  const filteredRepositories = repoData.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute -left-[75%] z-10 w-96 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-2">
            <div className="flex items-center p-2 mb-2 border-b">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="font-medium text-lg font-tiempos">{githubUsername}</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Search bar */}
            <div className="px-2 pb-2">
              <div className="relative">
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full py-2 pl-10 pr-4 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {repositories && filteredRepositories.length > 0 ? (
                filteredRepositories.map((repo) => {
                  const uiRepo = repositories.find(r => r.name === repo.name);
                  return (
                    <div key={repo.name} className="flex items-center justify-between p-4 hover:bg-gray-100 rounded-md">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                          <span className="text-primary font-semibold text-sm font-tiempos">
                            {repo.name.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-tiempos font-medium text-gray-900 flex items-center">
                            {repo.name}
                            {uiRepo?.private && (
                              <span className="ml-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </span>
                            )}
                          </p>
                          <p className="text-xs font-tiempos text-gray-500">{uiRepo?.lastUpdated}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRepoImport(repo.name, username, e)}
                        className={`px-3 py-2 font-sans text-xs font-medium ${
                          isAnalyzing 
                            ? 'text-gray-500 bg-gray-100 cursor-wait'
                            : 'text-white bg-[#171717] hover:bg-gray-900'
                        } rounded-md flex items-center space-x-2`}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && repo.name === selectedRepo ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          'Import'
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-sm text-gray-500">
                  Loading Repositories...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
