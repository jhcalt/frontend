import { url } from 'node:inspector';
import {redis} from '../../tools/redisClient';
import { clone_specific_repo, deleteContainer, generateContainerIPandURLandPORT, setContainerSpecsInDB } from './dashboardUtils';

const TOKEN_EXPIRATION_SECONDS = 20 * 60; // 20 mins


export async function storeFetchedContainersInfoToRedis(username: string, container_info: any): Promise<void> {
  const containerKey = `container_info:${username}`;

  try {
    // Validate container_info format
    if (!container_info || !Array.isArray(container_info)) {
      throw new Error("Invalid container_info format. Expected an array of container objects.");
    }

    await redis.setex(containerKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(container_info));
  } catch (error: any) {
    console.error("[storeFetchedContainersInfoToRedis] Error:", error.message || error);
    throw new Error("Failed to store fetched container info in Redis.");
  }
}

export async function checkRedisForContainerInfo(username: string): Promise<any> {
	const containerKey = `container_info:${username}`;

	try {
		// console.log("Checking Redis for container info for user:", username);
		const containerInfo = await redis.get(containerKey);

		if (!containerInfo) {
			return null;
		}
		else {
			// console.log("found in redis");
		}

		return JSON.parse(containerInfo);
	} catch (error: any) {
		console.error("[checkRedisForContainerInfo] Redis Error:", error);
		throw new Error("Failed to fetch container info from cache");
	}
}

export async function deleteContainerFromRedis(username: string, container_name: string, jwtAccess: string): Promise<void> {
	const containerKey = `container_info:${username}`;

	try {
		const existingData = await redis.get(containerKey);
		if (!existingData) {
			// console.log("[deleteContainerFromRedis] No container data found for user:", username);
			return;
		}

		const containers = JSON.parse(existingData);
		if (!Array.isArray(containers)) {
			throw new Error("Invalid container data format in Redis");
		}

		const updatedContainers = containers.filter(
			container => container.name !== container_name
		);

		if (updatedContainers.length === containers.length) {
			// console.log(`[deleteContainerFromRedis] Container '${container_name}' not found`);
			return;
		}

		await redis.setex(containerKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(updatedContainers));
		deleteContainer(container_name, jwtAccess);
		// console.log(`[deleteContainerFromRedis] Successfully deleted container '${container_name}'`);


	} catch (error: any) {
		console.error("[deleteContainerFromRedis] Error:", error.message || error);
		throw new Error(`Failed to delete container '${container_name}' from Redis`);
	}
}

// export async function createNewContainerRedis(username: string, container_name: string, url: string, ip_address: string) {
// 	const containerKey = `new_container_info:${username}`;

// 	try {
// 		const newContainer = { name: container_name, url: url, ip_address: ip_address };
		
// 		await redis.setex(containerKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(newContainer));
// 		// console.log(`[create	NewContainer] Successfully created container '${container_name}' for user '${username}'`);
// 	} catch (error: any) {
// 		console.error("[createNewContainer] Error:", error.message || error);
// 		throw new Error(`Failed to create container '${container_name}' for user '${username}'`);
// 	}
// }

export async function setContainerTechStack(username: string, topic: string, container_name: string, frontend: string, backend: string, db: string) {

	const original_container_name = container_name;
	const unique_container_name = await createUniqueContainerName(container_name, username);
	const containerKey = `new_container_info:${username}:${topic}`;
	
	try {

		const newContainer = { name: unique_container_name, frontend: frontend, backend: backend, db: db };
		
		console.log("Original container name: ", original_container_name);
		console.log("Unique container name: ", unique_container_name);
		await redis.setex(containerKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(newContainer));
		
		// console.log(`[setContainerSpecs] Successfully created container '${container_name}' specs for user '${username}'`);
		
		return newContainer;

	} catch (error: any) {
		console.error("[setContainerSpecs] Error:", error.message || error);
		throw new Error(`Failed to update container '${container_name}' specs for user '${username}'`);
	}
}

export async function setContainerServerStack(username: string, jwtAccess: string, topic: string, ram: string, mem: string, cpu: string) {
	const containerKey = `new_container_info:${username}:${topic}`;
	// console.log("[setContainerServerStack] Setting container server stack for user:", username);
	try {
		const existingData = await redis.get(containerKey);
		if (!existingData) {
			// console.log("[setContainerServerStack] No container data found for user:", username, topic);
			return;
		}

		let containerData;
		try {
			containerData = JSON.parse(existingData);
		} catch (parseError) {
			console.error("[setContainerServerStack] Failed to parse Redis data:", parseError);
			throw new Error("Invalid data format in Redis");
		}

		const container_name = containerData.name;

		const updatedContainer = {
			...containerData,
			ram,
			mem,
			cpu
		};

		await redis.setex(containerKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(updatedContainer));

		// console.log(`[setContainerServerStack] Successfully updated container '${container_name}' specs for user '${username}'`);

		// Get the original container name for repository cloning
		// Git repos use the original name without uniqueness suffix
		const original_repo_name = await getOriginalContainerName(container_name);
		console.log("Original repo name for cloning:", original_repo_name);
		
		// Clone the repo using the original name
		const was_repo_cloned = await clone_specific_repo(username, original_repo_name);

		if (!was_repo_cloned){
			// console.log(`[setContainerServerStack] Failed to clone repository for container '${original_repo_name}'`);
			return;
		}

		await generateContainerIPandURLandPORT(container_name, jwtAccess, username, topic, original_repo_name);
		
		return updatedContainer;

	} catch (error: any) {
		console.error("[setContainerServerStack] Error:", error.message || error);
		throw new Error(`Failed to update container specs for user '${username}', topic '${topic}'`);
	}
}



export async function getAllContainersCardInfo(username: string) {
	const containerKey = `container_info:${username}`;
	
	try {
		const existingData = await redis.get(containerKey);
		
		if (!existingData) {
			// console.log("[getContainerCardInfo] No container data found for user:", username);
			return;
		}
		
		const containers = JSON.parse(existingData);

		return containers.map((container: any) => ({
			name: container.name,
			url: container.url,
			created_time: container.created_time,
			running: container.running,
			gitlink: container.gitlink || '',
			specs: container.specs || { vcpu: 'N/A', ram: 'N/A' }
		}));

	} catch (error: any) {
		console.error("[getContainerCardInfo] Error:", error.message || error);
		throw new Error(`Failed to get container info for user '${username}'`);
	}
}

export async function getDetailedInfoSingleContainer(username: string, container_name: string) {
	const containerKey = `container_info:${username}`;
	
	try {
		const existingData = await redis.get(containerKey);
		
		if (!existingData) {
			// console.log("[getDetailedContainerInfo] No container data found for user:", username);
			return;
		}
		
		const containers = JSON.parse(existingData);
		
		const targetContainer = containers.find((container: any) => container.name === container_name);
		
		if (!targetContainer) {
			// console.log(`[getContainerCardInfo] Container '${container_name}' not found for user '${username}'`);
			return;
		}
		
		return targetContainer;
		
	} catch (error: any) {
		console.error("[getDetailedContainerInfo] Error:", error.message || error);
		throw new Error(`Failed to get container info for user '${username}'`);
	}
}

export async function createUniqueContainerName(container_name: string, username: string) {
    try {
        const existing_container_names = await redis.get(`containers:${username}`);
        let containerList: string[] = existing_container_names ? JSON.parse(existing_container_names) : [];

		// console.log(containerList);

        let unique_container_name = container_name;
        let count = 1;

        while (containerList.includes(unique_container_name)) {
            unique_container_name = `${container_name}-${count}`;
            count++;
        }

        // update Redis
        containerList.push(unique_container_name);
        await redis.set(`containers:${username}`, JSON.stringify(containerList));

        return unique_container_name;

    } catch (error: any) {
        console.error("[createUniqueContainerName] Error:", error.message || error);
        throw new Error("Failed to create unique container name");
    }
}

export async function getOriginalContainerName(uniqueContainerName: string): Promise<string> {
	// console.log("cleaning the repo name: ", uniqueContainerName);
    try {
        // Check if the container name has a -n suffix pattern
        const regex = /-(\d+)$/;
        const match = uniqueContainerName.match(regex);
        
        if (match) {
            return uniqueContainerName.substring(0, uniqueContainerName.length - match[0].length);
        }
        
        // If there's no -n suffix, return the original name
        return uniqueContainerName;
    } catch (error: any) {
        console.error("[getOriginalContainerName] Error:", error.message || error);
        return uniqueContainerName;
    }
}

export async function extractDataFromRedisAndSendToDB(username: string, container_name: string, jwtAccess: string) {
	const containerKey = `new_container_info:${username}`;
 
	try {
		const existingData = await redis.get(containerKey);
 
		if (!existingData) {
			// console.log("[extractDataFromRedis] No container data found for user:", username);
			return;
		}
 
		const containerData = JSON.parse(existingData);
		
		const { frontend, backend, db, ram, mem, cpu } = containerData;
		
		if (!frontend || !backend || !db || !ram || !mem || !cpu) {
			// console.log("[extractDataFromRedis] Missing required fields in container data");
			return;
		}
 
		await setContainerSpecsInDB(container_name, frontend, backend, db, ram, mem, cpu, jwtAccess,);
 
	} catch (error) {
		console.error("[extractDataFromRedis] Error extracting data:", error);
		throw new Error(`Failed to extract container data: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
 }


