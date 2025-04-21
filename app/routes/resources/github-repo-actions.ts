import { ActionFunction, data } from "react-router";
import { getUsernameFromCookie, getJwtAccess } from "~/utils/auth/cookieUtils";
import { fetchUserReposfromDB, type RepoData } from "~/utils/auth/githubUtils";

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("[github-repo-actions] Action function called");
    const username = await getUsernameFromCookie(request);
    console.log("[github-repo-actions] Username from cookie:", username);
    
    if (!username) {
      console.log("[github-repo-actions] No username found, returning 401");
      return data({ error: "User not authenticated" }, { status: 401 });
    }

    console.log("[github-repo-actions] Fetching repos from DB for user:", username);
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
      console.log("[github-repo-actions] Calling fetchUserReposfromDB");
      const response = await fetchUserReposfromDB(username);
      console.log("[github-repo-actions] Repos fetched successfully");
      
      // Extract the repo_data from the response
      let repoData: RepoData[] = [];
      
      if (response && Array.isArray(response) && response.length > 0) {
        // Find the entry for the current user
        const userEntry = response.find(entry => entry.github_username === username);
        if (userEntry && Array.isArray(userEntry.repo_data)) {
          repoData = userEntry.repo_data;
        }
      }
      
      console.log("[github-repo-actions] GitHub repos result type:", typeof repoData);
      console.log("[github-repo-actions] GitHub repos result is array:", Array.isArray(repoData));
      console.log("[github-repo-actions] GitHub repos result length:", repoData.length);
      console.log("[github-repo-actions] GitHub repos result data:", JSON.stringify(repoData, null, 2));
      
      console.log("[github-repo-actions] Returning successful response");
      return data({ 
        success: true, 
        githubRepos: repoData 
      });
    } catch (dbError) {
      console.error("[github-repo-actions] Error fetching from DB:", dbError);
      return data({ 
        success: true, 
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