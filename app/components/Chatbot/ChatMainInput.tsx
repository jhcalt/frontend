import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faChevronDown, faArrowCircleUp,} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useFetcher, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import type { RequestLoaderData } from "~/routes/chat";
import PromptCarousel from "../UI/PromptCarousel";
import { TooltipWrapper } from "../UI/ToolTip";
import QrooperAnalysisDisplay from "../Qrooper/QrooperAnalysisDisplay";


export interface RepoData {
  name: string;
  visibility: "public" | "private";
  last_push: string;
}

interface ChatMainInputProps {
  request: RequestLoaderData;
}

const ChatMainInput = ({ request }: ChatMainInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  useEffect(() => {
    // Get initial repo name
    const repoName = sessionStorage.getItem('repoName') || '';
    setSelectedRepo(repoName);

    // Listen for custom event for real-time updates
    const handleRepoChange = (e: CustomEvent) => {
      setSelectedRepo(e.detail);
      setIsAnalyzing(true); // Start analysis when repo changes
    };

    // Listen for analysis completion
    const handleAnalysisComplete = (e: CustomEvent) => {
      setIsAnalyzing(false);
      setAnalysisCompleted(true);
      // Get the Qrooper analysis result from sessionStorage
      const result = e.detail;
      console.log('Qrooper Analysis Result (from customevent):', result);
      // You can use the result here as needed, e.g., display it or update state
    };

    // TypeScript type assertion for CustomEvent
    window.addEventListener('repoNameChange', handleRepoChange as EventListener);
    window.addEventListener('qrooperAnalysisComplete', handleAnalysisComplete as EventListener);
    
    // Also keep the storage event listener for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'repoName') {
        setSelectedRepo(e.newValue || '');
        setIsAnalyzing(true); // Start analysis when repo changes
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('repoNameChange', handleRepoChange as EventListener);
      window.removeEventListener('qrooperAnalysisComplete', handleAnalysisComplete as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const setText = (text: string) => {
    setMessage(text);
  };

  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const chatFetcher = useFetcher();
  const isSubmitting = chatFetcher.state === "submitting";
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Handle chat submission response
  useEffect(() => {
    if (chatFetcher.data && chatFetcher.state === "idle") {
      if (chatFetcher.data.success && chatFetcher.data.redirectUrl) {
        console.log("Redirecting to:", chatFetcher.data.redirectUrl);
        navigate(chatFetcher.data.redirectUrl);
        setMessage("");
      } else if (chatFetcher.data.error) {
        console.error("Submission error:", chatFetcher.data.error);
      }
    }
  }, [chatFetcher.data, chatFetcher.state, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting && message.trim()) {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("deployedChats", JSON.stringify(request.deployedChats));
      formData.append(
        "undeployedChats",
        JSON.stringify(request.undeployedChats)
      );
      const repoName = sessionStorage.getItem('repoName') || '';
      formData.append("repoName", repoName);
      chatFetcher.submit(formData, {
        method: "post",
        action: "/resources/chatmaininput-actions",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center w-full">
      <div className="max-w-3xl w-full p-2 sm:p-4 space-y-2 sm:space-y-4">
        <chatFetcher.Form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-3 sm:p-4"
        >
          <textarea
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[10px] resize-none border-0 focus:outline-none text-base sm:text-lg"
            placeholder="shoot your query..."
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex space-x-1 sm:space-x-2">
              <button
                type="button"
                className="pb-1 pt-2 px-2 sm:px-3 border-2 border-slate-100 rounded-lg transition-all duration-200 text-icon active:animate-bounce-subtle"
              >
                <TooltipWrapper content="Upload Code" position="bottom">
                  <FontAwesomeIcon
                    icon={faCode}
                    className="w-4 h-4 sm:w-5 sm:h-5 p-0 hover:text-primary"
                  />
                </TooltipWrapper>
              </button>

              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <button
                  className={`pb-2 pt-2 px-2 sm:px-3 border-2 border-slate-100 rounded-lg transition-all duration-300 flex items-center text-icon active:animate-bounce-subtle ${
                    isHovered || selectedRepo ? "w-auto min-w-[36px]" : "w-auto"
                  }`}
                  type="button"
                  aria-haspopup="true"
                >
                  <FontAwesomeIcon
                    icon={faGithub}
                    className="w-4 h-4 sm:w-5 sm:h-5 p-0 hover:text-primary"
                  />
                  {(isHovered || selectedRepo) && (
                    <span className="ml-2 transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] sm:max-w-[150px] text-xs sm:text-sm">
                      {selectedRepo || null}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !message.trim() || !selectedRepo}
              className={`hover:scale-110 transition-transform rounded-full ml-auto ${
                isSubmitting || !message.trim() || !selectedRepo
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <FontAwesomeIcon
                icon={faArrowCircleUp}
                className={`w-6 h-6 sm:w-8 sm:h-8 ${
                  isSubmitting || !selectedRepo ? "text-gray-400" : "text-primary"
                }`}
              />
            </button>
          </div>
        </chatFetcher.Form>

        {chatFetcher.data?.error && (
          <div className="text-red-500 text-sm text-center">
            {chatFetcher.data.error}
          </div>
        )}
        {isAnalyzing ? (
          <QrooperAnalysisDisplay 
            onComplete={() => setIsAnalyzing(false)}
            repoName={selectedRepo}
          />
        ) : !analysisCompleted && (
          <PromptCarousel setText={setText} />
        )}
      </div>
    </div>
  );
};

export default ChatMainInput;
