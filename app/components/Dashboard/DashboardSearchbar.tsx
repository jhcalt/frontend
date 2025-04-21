import { FC } from "react";
import { Search } from "lucide-react";

interface DashboardSearchbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DashboardSearchbar: FC<DashboardSearchbarProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="relative flex-1 w-full max-w-full sm:max-w-2xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
      <input
        type="text"
        placeholder="Search Repositories..."
        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md
                 focus:outline-none focus:ring-1 focus:ring-primary text-sm sm:text-base"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search repositories and projects"
      />
    </div>
  );
};

export default DashboardSearchbar;
