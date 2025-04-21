import { FC, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DashboardSortButtonProps {
  sortCriteria: string;
  setSortCriteria: (criteria: string) => void;
}

const DashboardSortButton: FC<DashboardSortButtonProps> = ({
  sortCriteria,
  setSortCriteria,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSort = (criteria: string) => {
    setSortCriteria(criteria);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full sm:w-auto space-x-2 px-4 py-2 border border-border rounded-md hover:bg-secondary/10 transition-all"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <span className="text-sm sm:text-base">Sort by {sortCriteria === "activity" ? "Created Time" : sortCriteria}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full sm:w-56 bg-background border border-border rounded-md shadow-lg right-0 sm:right-auto">
          <button
            type="button"
            className="block w-full px-4 py-2 text-left hover:bg-secondary/10 text-sm sm:text-base transition-colors"
            onClick={() => handleSort("name")}
          >
            Sort by Name
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left hover:bg-secondary/10 text-sm sm:text-base transition-colors"
            onClick={() => handleSort("activity")}
          >
            Sort by Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardSortButton;
