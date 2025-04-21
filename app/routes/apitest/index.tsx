import { json, LoaderFunctionArgs } from "@remix-run/router";
import {getJwtAccess} from "~/utils/auth/cookieUtils";
import { fetchUserReposfromDB } from "~/utils/auth/githubUtils";
import { clone_specific_repo, dockerImageCreation, generateContainerIPandURLandPORT } from "~/utils/dashboard/dashboardUtils";
import { getAllContainersCardInfo, setContainerServerStack, setContainerTechStack } from "~/utils/dashboard/dashboardUtils_redis";



export const loader = async ({ request }: LoaderFunctionArgs ) => {
	try {
		const jwtAccess = getJwtAccess(request); // Assuming this function retrieves the JWT token
		if (!jwtAccess) {
			throw new Error("JWT access token is missing.");
		}

		const testContainerName = "WorldPersonalities-PlaySchoo-21";
		const testUsername = "jugaad";
		const currentTopic = "New Chat 200";
		const newTopic = "testing if reusable function is working";
		const testJwtAccess = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg5MjY2MDM4LCJpYXQiOjE3MzkyNjYwMzgsImp0aSI6ImVjODIwM2Q2M2YzNDQ4MGNhN2U1MGNiNWU0NDA4ZWMxIiwidXNlcl9pZCI6MTAsInVzZXJuYW1lIjoianVnYWFkIn0.FQLXCe_VNVo5WhN0uycbFF1I-cbpJLjymmjN5rLK0ko";

		// console.log("[loader] Test Parameters for updateTopic:");
		console.log(`  Username: ${testUsername}`);
		console.log(`  Current Topic: ${currentTopic}`);

		// Call the updateTopic function
		
		// const result = await getUserChatMessagesFromDB(testUsername, currentTopic, testJwtAccess);
		// console.log("[loader] Delete Chat API Response:", result);
		// const result = await checkRedisForMessages(testUsername, currentTopic);
		// const result = await getUserChatMessages(testUsername, currentTopic, testJwtAccess);
		// const result = await updateUserChatTopic(currentTopic,newTopic,testJwtAccess);
		// const result = await deleteUserChat(testUsername, newTopic, testJwtAccess); 
		// const result = await getAllContainerInfoFromDB(testJwtAccess);
		const result = await getAllContainersCardInfo("dockertest");
		// const result = await createNewContainerRedis(testUsername, "testinging    myself", "http://localhost:3000", "127.0.0.1");
		
		// const result = await setContainerTechStack(testUsername, currentTopic, testContainerName, "react", "laravel", "mysql");

		// const result = await setContainerServerStack("jugaad", testJwtAccess, currentTopic, "1gb", "2gb", "1");

		// const result = await fetchUserReposfromRedis("jaggi");

		// const result = await generateContainerIPandURLandPORT(testContainerName, testJwtAccess, testUsername, currentTopic, testContainerName);

		// const result = await dockerImageCreation(testContainerName, "laravel_v10", testJwtAccess, "WorldPersonalities-PlaySchool");

		// const result = await clone_specific_repo("jugaad", "Personal-Website");

		// const result = await fetchUserReposfromDB(testUsername, testJwtAccess);
		
		// const result = await setContainerServerStack("jugaad", "Por", "1gb", "2gb", "1");

		// const result = await createNewContainer(testUsername, "test container", "http://localhost:3000", "127.0.0.1");

		// const message = {"user": "Hello", "assistant": "World"} 
		// sendNewMessageToRedis(testUsername, currentTopic, message);

		// const newTopic = "new topic";
		// createNewChat(testUsername, newTopic);


		return json(result); // Wrap the result in a JSON response
		// return json(message);
	} catch (error: any) {
		console.error("[loader] Error in deleteChat:", error.message || error);

		// Return a JSON response for the error
		return json(
			{ error: error.message || "Unexpected error occurred" },
			{ status: 500 }
		);
	}
};

