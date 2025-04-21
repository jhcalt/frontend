import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFetcher, useSubmit } from 'react-router';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import GitHubRepoDropdown from './GithubRepoDropdown';
import { RepoData } from '~/types/github-types';

interface GithubButtonProps {
  username: string;
  isGithubConnected?: boolean;
}

const GithubButton: React.FC<GithubButtonProps> = ({ username, isGithubConnected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const githubRepoFetcher = useFetcher();
  const [githubRepos, setGithubRepos] = useState<RepoData[]>([]);
  const [githubUsername, setGithubUsername] = useState<string>();

  const [isGlowActive, setIsGlowActive] = useState(false);

  
  useEffect(() => {
    if (githubRepoFetcher.data && githubRepoFetcher.state === "idle") {
        // console.log("GitHub repos data:", githubRepoFetcher.data.githubRepos);
        setGithubRepos(githubRepoFetcher.data.githubRepos);
        setGithubUsername(githubRepoFetcher.data.githubUsername)
    }
  }, [githubRepoFetcher.data, githubRepoFetcher.state]);

  useEffect(() => {
    if (isGithubConnected) {
      setIsGlowActive(true);
      const timer = setTimeout(() => {
        setIsGlowActive(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isGithubConnected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    if (!isGithubConnected) {
      window.location.href = `https://git.quantumsenses.com/install?username=${encodeURIComponent(username)}`;
    } else {
      githubRepoFetcher.submit({}, {
        method: "post",
        action: "/resources/github/github-repo-actions",
      });

      setIsOpen(!isOpen);
    }
  };

  const handleImport = useCallback((repoName: string) => {
    // Store the single repo name in sessionStorage
    sessionStorage.setItem('repoName', repoName);
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('repoNameChange', { detail: repoName }));
    
    // Close the dropdown after import
    // setIsOpen(false);
  }, []);


  return (
    <div className="relative"  ref={dropdownRef}>
      <button
        type="button"
        onClick={handleClick}
        className={`relative flex items-center gap-2 px-4 py-[6px] border-2 border-slate-100 text-slate-800 rounded-lg hover:bg-[#24292E] hover:text-white hover:border-slate-800 transition-colors ${isGithubConnected && isGlowActive ? 'animate-green-glow' : (!isGithubConnected ? 'animate-red-glow-sm' : '')}`}
      >
        <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
        {isGithubConnected ? (
          <>
            <span>Connected</span>
            <span className="w-2 h-2 bg-green-500 rounded-full ml-1"></span>
          </>
        ) : (
          <span>Connect to GitHub</span>
        )}
      </button>
      {isOpen && isGithubConnected && (
        <GitHubRepoDropdown
          onGithubRepoImport={handleImport}
          githubUsername={githubUsername || ""}
          repoData={githubRepos}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          username={username}
        />
      )}
    </div>
  );
};

export default GithubButton;