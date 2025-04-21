// app/components/Dashboard/DashboardHomeInterface.tsx
import { type FC, useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import type { Container } from "~/types/dashboard-types";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSearchbar from "./DashboardSearchbar";
import DashboardSortButton from "./DashboardSortButton";
import DashboardPaginatedGrid from "./DashboardPaginatedGrid";
import { Link } from "react-router";
import { generateContainerUrl } from "~/utils/urlUtils";
import Navbar from "../UI/Navbar";

interface DashboardHomeInterfaceProps {
  containers: Container[];
  username: string;
  userData: {
    username: string;
    email?: string;
    github_connected?: number;
    first_name?: string;
    last_name?: string;
  };
  noContainers?: boolean;
}

export const DashboardHomeInterface: FC<DashboardHomeInterfaceProps> = ({
  containers,
  username,
  userData,
  noContainers = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState<"name" | "activity">("activity"); // Default sort criteria

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        userData={{
          username: userData.username,
          email: userData.email,
          github_connected: userData.github_connected,
          first_name: userData.first_name,
          last_name: userData.last_name,
        }} 
      />
      <DashboardNavbar username={username} userData={userData} />

      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {(containers.length === 0 || noContainers) ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-medium text-gray-500 mb-4">No Containers Deployed</h1>
          </div>
        ) : (
          <>
            <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-2 mb-6">
              <DashboardSearchbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start w-full sm:w-auto gap-2 mt-3 sm:mt-0">
                <DashboardSortButton
                  sortCriteria={sortCriteria}
                  setSortCriteria={setSortCriteria}
                />

                <div className="flex items-center border border-border rounded-md">
                  <button
                    type="button"
                    className="p-2 hover:bg-secondary/10 transition-colors duration-200"
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-secondary/10 border-l border-border transition-colors duration-200"
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to={"/chat"}
                  type="button"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white
                           rounded-md hover:bg-primary/90 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add New...</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              </div>
            </div>

            <DashboardPaginatedGrid
              containers={containers}
              username={username}
              searchQuery={searchQuery}
              sortCriteria={sortCriteria}
              generateContainerUrl={generateContainerUrl}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardHomeInterface;
