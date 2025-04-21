import { useMatches } from "react-router";
import { Link } from "react-router";
import type { RouteHandle, Breadcrumb } from "../../types/ui-types";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
  const matches = useMatches();

  // Filter out matches without a handle or without breadcrumb data in the handle
  const breadcrumbs: Breadcrumb[] = matches.reduce(
    (acc: Breadcrumb[], match) => {
      if (match.handle) {
        const routeHandle = match.handle as RouteHandle;
        if (routeHandle.breadcrumb) {
          let breadcrumbData = routeHandle.breadcrumb;
          if (typeof breadcrumbData === "function") {
            breadcrumbData = breadcrumbData(match.data);
          }
          if (Array.isArray(breadcrumbData)) {
            // Handle multiple breadcrumbs from a single route
            acc.push(...breadcrumbData);
          } else {
            acc.push(breadcrumbData);
          }
        }
      }
      return acc;
    },
    []
  );

  return (
    <div className="ml-2 mt-1 flex items-center gap-1 text-md font-tiempos font-[500] text-muted-foreground">
      <ChevronRight className="h-4 w-4" />
      {breadcrumbs.map((breadcrumb: Breadcrumb, index: number) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="mx-1 h-4 w-4" />}
          {breadcrumb.path ? (
            <Link to={breadcrumb.path} className="hover:text-primary">
              {breadcrumb.title}
            </Link>
          ) : (
            <span className="max-w-[150px] truncate overflow-hidden whitespace-nowrap">
              {breadcrumb.title}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
