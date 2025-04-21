import { GitHubResponseData } from '~/types/github-types';


export async function fetchUserReposfromDB(username: string): Promise<GitHubResponseData> {
    const endpoint = `https://git.quantumsenses.com/get_repo_name_from_github/${username}`

    try {
        console.log(`[fetchUserReposfromDB] Fetching from endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[fetchUserReposfromDB] Error response: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json() as GitHubResponseData;
        console.log("GITHUB REPOS RESPONSE:", responseData.repoData)

        // console.log(`[fetchUserReposfromDB] Response data:`, responseData);
        
        return responseData;
    } catch (error: any) {
        console.error("[fetchUserReposfromDB] Error:", error.message || error);
        throw new Error(error.message || "Something went wrong while fetching user repos.");
    }
}

