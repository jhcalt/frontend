import { ActionFunction, data } from "react-router";
import { getUsernameFromCookie, getJwtAccess } from "~/utils/auth/cookieUtils";
import { fetchUserReposfromDB } from "~/utils/auth/githubUtils";
import { GitHubResponseData, RepoData } from "~/types/github-types";

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("GITHUB REPO ACTION FUNCTION CALLED");
    const username = await getUsernameFromCookie(request);
    
    if (!username) {
      console.log("[github-repo-actions] No username found, returning 401");
      return data({ error: "User not authenticated" }, { status: 401 });
    }

    // console.log("[github-repo-actions] Fetching repos from DB for user:", username);
    const jwtAccess = await getJwtAccess(request);
    
    if (!jwtAccess) {
      console.log("[github-repo-actions] No JWT access token found, returning empty array");
      return data({ 
        success: true, 
        githubRepos: []
      });
    }
    
    try {
      // Fetch directly from the API endpoint
      const response = await fetchUserReposfromDB(username);
      
      return data({ 
        githubUsername: response.githubUsername,
        githubRepos: response.repoData
      });
    } catch (dbError) {
      console.error("[github-repo-actions] Error fetching from DB:", dbError);
      return data({ 
        githubRepos: [] 
      });
    }
  } catch (error: any) {
    console.error("[github-repo-actions] Error fetching GitHub repos:", error);
    return data({ 
      error: error.message || "Failed to fetch GitHub repositories" 
    }, { status: 500 });
  }
};