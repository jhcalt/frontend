import { apiFunction, responseLogging } from "~/tools/reusableFunctions";
import { redis } from "~/tools/redisClient";
import { checkRedisForContainerInfo, extractDataFromRedisAndSendToDB, storeFetchedContainersInfoToRedis } from "./dashboardUtils_redis";
import type { Container } from "~/types/dashboard-types";
import { getJwtRefresh } from "../auth/cookieUtils";
import { sendNewMessageToRedis } from "../chatbot/messageUtils";


export async function getUserContainerInfo(username: string, jwtAccess: string) {
	
	try {
		// const redisData = await checkRedisForContainerInfo(username);

		// if (redisData) {
		// 	console.log("found data in redis");
		// 	return redisData;
		// } 
		// else if(!redisData) {
			try {
				const dbData = await getAllContainerInfoFromDB(jwtAccess);
				console.log("fetched data from db");
				return dbData;
			} catch (dbError: any) {
				// Handle the 404 error specifically
				if (dbError.status === 404) {
					console.log("No containers found for this user");
					return null;
				}
				throw dbError; // Re-throw other errors
			}
		// }
		// else {
		// 	return null;
		// }
	} catch (error: any) {
		console.error("[getUserContainerInfo] Error:", error.message || error);
		throw new Error(error.message || "Failed to retrieve container info");
	}
}



export async function getAllContainerInfoFromDB(jwtAccess: string) {
	const endpoint = `${process.env.SERVER_API_URL}/container/get-container`;
   
	try {
		if (!jwtAccess) {
			throw new Error("JWT Access token is required");
		}
		
		const response = await apiFunction(endpoint, "GET", jwtAccess);
		
		// If we get an auth error, then log the response for debugging
		if (response.status === 401) {
			const errorData = await response.json();
			console.error("[getAllContainerInfo] Auth Error:", {
				status: response.status,
				headers: Object.fromEntries(response.headers),
				error: errorData
			});
			throw new Error("Authentication failed");
		}

		// Handle 404 error (No containers found)
		if (response.status === 404) {
			const errorData = await response.json();
			console.error("[dashboardUtils.ts] getAllContainerInfoFromDB API Error:", {
				status: 404,
				statusText: 'Not Found',
				error: errorData
			});
			
			// Create a custom error with status code
			const error = new Error("No containers found for this user");
			(error as any).status = 404;
			throw error;
		}
		
		const responseData = await responseLogging(response, "[dashboardUtils.ts]", "getAllContainerInfoFromDB API", false);

		storeFetchedContainersInfoToRedis("jugaad", responseData);
		
		return responseData;
	}
	catch (error: any) {
		console.error("[dashboardUtils.ts] Error while getting all containers for user:", error);
		throw error;
	}
}

// NEW FUNCTION: Fetch individual container info
export async function getIndividualContainerInfo(
	jwtAccess: string,
	containerName: string
  ): Promise<Container | null> {
	const endpoint = `${process.env.SERVER_API_URL}/container/get-container/${containerName}`;
  
	try {
	  if (!jwtAccess) {
		throw new Error("JWT Access token is required");
	  }
  
	  const response = await apiFunction(endpoint, "GET", jwtAccess);
  
	  if (response.status === 404) {
		return null; // Container not found
	  }
  
	  if (!response.ok) {
		const errorData = await response.json();
		console.error("[getIndividualContainerInfo] Error:", {
		  status: response.status,
		  headers: Object.fromEntries(response.headers),
		  error: errorData,
		});
		throw new Error(
		  `Failed to fetch container: ${response.status} - ${response.statusText}`
		);
	  }
	  const contData = await response.json();
	  return contData; // Assuming your API returns a single Container object
	} catch (error: any) {
	  console.error(
		"[dashboardUtils.ts] Error fetching individual container:",
		error
	  );
	  throw error; // Re-throw for the loader
	}
  }

export async function toggleContainerState(container_name:string, jwtAccess: string) {

	const endpoint = `${process.env.SERVER_API_URL}/container/state-controller`;
	const payload= {
		container_name: container_name,
	};

	try {

		const response = await apiFunction(endpoint, "PATCH", jwtAccess, payload);

		const responseData = responseLogging(response, "[dashboardUtils.ts]", "changeContainerState API", false);
		return responseData;
	}
	catch (error: any) {
		console.error("[dashboardUtils.ts] Error while changing container state", error);
		throw new Error(error.message || "something went wrong");
	}
} 


export async function createNewContainerInDB(username: string, container_name:string, url:string, ip_address: string, jwtAccess:string)
{
	const endpoint = `${process.env.SERVER_API_URL}/container/create`;
	
	const payload = { name:container_name, url: url, ip_address:ip_address }
	
	try {
		const response = await apiFunction(endpoint, "POST", jwtAccess,payload);

		const responseData = responseLogging(response, "[dashboardUtils.ts]", "createNewContainer API", false);
		
		// createNewContainerRedis(username, container_name, url, ip_address);
		
		return responseData;
	}
	catch (error: any) {
		console.error("[dashboardUtils.ts] Error while creating new container", error);
		throw new Error(error.message || "something went wrong");
	}
}

export async function setContainerSpecsInDB(container_name:string, frontend:string, backend:string, db:string, ram:string, mem:string, cpu:string, jwtAccess:string) {
	const endpoint  = `${process.env.SERVER_API_URL}/container/set-specs`;
	const payload = {
		container_name: container_name,
		stack: `frontend: ${frontend}, backend: ${backend}, database: ${db}`,
		resources: `ram: ${ram}GB, mem: ${mem}GB, cpu: ${cpu}` 
	}

	try {
		const response = await apiFunction(endpoint, "POST", jwtAccess, payload);

		const responseData = responseLogging(response, "[dashboardUtils.ts]", "setContainerServerStack API", false);
		return responseData;
	}
	catch (error: any) {
		console.error("[dashboardUtils.ts] Error while setting container specs", error);
		throw new Error(error.message || "something went wrong");
	}
}



export async function deleteContainer(container_name:string, jwtAccess:string) {
	const endpoint = `${process.env.SERVER_API_URL}/container/delete/${container_name}`;
	
	
	try {
		const response = await apiFunction(endpoint, "DELETE", jwtAccess);

		const responseData = await responseLogging(response, "[dashboardUtils.ts]", "deleteContainer API", false);

		return responseData;
	}
	catch (error: any) {
		console.error("[dashboardUtils.ts] Error while deleting container", error);
		throw new Error(error.message || "something went wrong");
	}
}

export async function gitRepoLink(container_name: string, jwtAccess: string, gitlink: string) {
	const endpoint = `${process.env.SERVER_API_URL}/container/git-link`;
	
	const payload = {
		container_name: container_name,
		gitlink: gitlink
	};
	
	try {
		const response = await apiFunction(endpoint, "POST", jwtAccess, payload);

		const responseData = await responseLogging(response, "[dashboardUtils.ts]", "gitRepoLink API", false);
		
		return responseData;
	} catch (error: any) {
		console.error("[dashboardUtils.ts] Error while linking git repo", error);
		throw new Error(error.message || "something went wrong");
	}	
}

export async function dockerImageCreation(container_name: string, image_name: string, jwtAccess: string, github_repo_name: string) {
	const endpoint = `${process.env.SERVER_API_URL}/container/spinup-container/`;
	
	// Always use the provided container_name which should already be unique
	// The image_name parameter is frontend framework but we're hardcoding react for now
	const payload = {
		container_name: container_name, // This should be the unique container name from createUniqueContainerName
		image_name: "react",
		network: "hackniche",
		github_repo_name: github_repo_name
	};
	
	try {
		const response = await apiFunction(endpoint,"POST",jwtAccess, payload);
		
		const responseData = await responseLogging(response, "[dashboardUtils.ts]", "dockerImageCreation API", false);
		
		return responseData;
	} catch (error:any) {
		console.error("[dashboardUtils.ts] error in docker spinup ", error);
		throw new Error(error.message || "something went wrong");
	}
}

export async function generateContainerIPandURLandPORT(container_name: string, jwtAccess: string, username: string, topic: string, github_repo_name: string): Promise<void> {
	const containerKey = `new_container_info:${username}:${topic}`;
	try {
		const existingData = await redis.get(containerKey);
		if (!existingData) {
			throw new Error('No container data found');
		}
 
		const containerData = JSON.parse(existingData);
		const frontend = containerData.frontend;
		if (!frontend) {
			throw new Error('Frontend data not found in container info');
		}

		console.log("GENERATEIP OPENEDDDD")
		const dockerResponse = await dockerImageCreation(container_name, frontend, jwtAccess, github_repo_name);
		console.log("DOCKER RESPONSE: ", dockerResponse);

		//trimming dockerResponse from {success, host, port, url} to {host, url}
		const { host, url } = dockerResponse;
		
		//Adding docker response to messages
		const messageWithDockerResponse = {
			assistant : `{"host": "${host}", "url": "${url}"}`,
			user: '$DOCKERRESPONSEEND$'
		}
		sendNewMessageToRedis(username, topic, messageWithDockerResponse)
		console.log("SENDING DOCKER RESPONSE TO REDIS: ", messageWithDockerResponse)

		
		// console.log (host, url);
		if (!url || !host) {
			throw new Error('URL or IP address not received from docker creation');
		}

		await appendContainerInfo(username, container_name, url);
 
		await createNewContainerInDB(username, container_name, url, host, jwtAccess);
		
		await extractDataFromRedisAndSendToDB(username,container_name,jwtAccess); 

	} catch (error: any) {
		console.error('Error in generateContainerIPandURLandPORT:', error);
		throw new Error(`Failed to generate container details: ${error.message}`);
	}
 }

export async function appendContainerInfo(username: string, name: string, url: string) {
    const containerKey = `container_info:${username}`;
    
	console.log("new container created in redis");

    try {
        const existingData = await redis.get(containerKey);
        let containers = [];


        
        if (existingData) {
            containers = JSON.parse(existingData);
			console.log("existingData: ", existingData);
        }

		console.log("there might be no containers: ", containers);
        
        // Create current timestamp
        const created_time = new Date().toISOString();
        
        // Create new container info object
        const newContainerInfo = {
            name,
            url,
            created_time,
            running: true
        };
        
        // Add the new container info to the array
        containers.push(newContainerInfo);
        
        // Save back to Redis
        await redis.set(containerKey, JSON.stringify(containers));
        
        return newContainerInfo;
    } catch (error: any) {
        console.error("[appendContainerInfo] Error:", error.message || error);
        throw new Error(`Failed to append container info for user '${username}'`);
    }
}


export async function clone_specific_repo(username: string, container_name:string) {

	console.log("this is the repo we are going to clone: ", container_name);

	const endpoint = `https://git.quantumsenses.com/clone_or_pull_repos/${username}/${container_name}`;

	try {
		const response = await fetch(endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		
		const responseData = await response.json();
		return responseData.status;

	} catch (error: any) {
		console.error("[clone_specific_repo] Error:", error.message || error);
		throw new Error(error.message || "Something went wrong while cloning repository.");
	}
}