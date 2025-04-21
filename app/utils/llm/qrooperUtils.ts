export async function fetchQrooperResult(query : string, repoName : string, username: string) {
    const endpoint = `https://qrooper.quantumsenses.com/main-qrooper-analyze/${username}/${encodeURIComponent(repoName)}/${encodeURIComponent(query)}`
    
    try {
        console.log("QROOPER REQ HIT...")
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[fetchQrooperResult] Error response: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json()
        console.log("QROOPER RESULT:", responseData)
        
        return {
            data: responseData,
            status: response.status,
            ok: response.ok
        };
    } catch (error: any) {
        console.error("[fetchQrooperResult] Error:", error.message || error);
        throw new Error(error.message || "Something went wrong while fetching Qrooper result.");
    }
}