import React, { useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import { Container } from "~/types/dashboard-types";
import DashboardInstanceCard from "./DashboardInstance/DashboardInstanceCard";

interface DashboardPaginatedGridProps {
  containers: Container[];
  username: string;
  searchQuery: string;
  sortCriteria: "name" | "activity";
  generateContainerUrl: (username: string, containerName: string) => string;
}

const DashboardPaginatedGrid: React.FC<DashboardPaginatedGridProps> = ({
  containers,
  username,
  searchQuery,
  sortCriteria,
  generateContainerUrl,
}) => {
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredContainers = containers
    .filter((container: Container) =>
      container.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortCriteria === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortCriteria === "activity") {
        return (
          new Date(b.created_time).getTime() -
          new Date(a.created_time).getTime()
        );
      }
      return 0;
    });

  const hasMore = filteredContainers.length > visibleCount;

  const loadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-6 md:px-10">
        {filteredContainers.slice(0, visibleCount).map((container) => {
          const slug = generateContainerUrl(username, container.name);

          return (
            <Link to={`${slug}`} key={container.name} className="w-full">
              <DashboardInstanceCard
                username={username}
                container={container}
              />
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="relative mt-8 sm:mt-10">
          {/* Blurred instances preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-6 md:px-10 opacity-30 blur-sm pointer-events-none h-24 sm:h-32 overflow-hidden">
            {filteredContainers
              .slice(visibleCount, visibleCount + 3)
              .map((container) => {
                const slug = generateContainerUrl(username, container.name);

                return (
                  <div
                    key={container.name}
                    className="rounded-lg border bg-gray-400 shadow-sm"
                  >
                    {/* Simplified placeholder card */}
                    <div className="p-4 h-full rounded-lg">
                      <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Load more button centered over the blurred instances */}
          <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
            <button
              onClick={loadMore}
              className="flex items-center gap-2 font-tiempos font-medium text-grey text-base sm:text-xl hover:text-primary transition-colors duration-200 py-2 px-4 rounded-lg active:animate-bounce-subtle group"
            >
              <span className="group-hover:animate-slide-in-right">
                Load More
              </span>
              <ChevronDown
                size={20}
                className="transition-transform duration-300 group-hover:translate-y-1 group-active:animate-spring-in"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPaginatedGrid;
