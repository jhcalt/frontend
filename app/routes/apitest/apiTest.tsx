import { json, LoaderFunctionArgs } from "@remix-run/router";
import { dockerImageCreation, generateContainerIPandURLandPORT } from "~/utils/dashboard/dashboardUtils";
import { createNewContainerRedis, getAllContainersCardInfo, setContainerServerStack, setContainerTechStack } from "~/utils/dashboard/dashboardUtils_redis";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const testUname = "jugaad";
	const testContainerName = "nauntests";
	const testTopic = "test";
	const url = new URL(request.url);
	const action = url.searchParams.get("action");
	const testJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg2NTg0MjIwLCJpYXQiOjE3MzY1ODQyMjAsImp0aSI6IjFmNjE1MTQ1NDdmZTRjZmVhYTgyOTA5YjU5NGQxODA4IiwidXNlcl9pZCI6MTAsInVzZXJuYW1lIjoianVnYWFkIn0.6lg-tiEpZrh7owbbR2DghDVrPguDKmhtsMCVrS-u30k";

	try {
		// const result = await getAllContainersCardInfo(testUname);
		// const result = await createNewContainerRedis(testUname, testContainerName, "http://localhost:3000", "127.0.0.1");
		
		// redis new container creation test cases //
		// const result = await setContainerTechStack(testUname, testContainerName, "laravel_v10", "laravel", "mysql");
		const result = await setContainerServerStack(testUname, testJWT, testTopic,testContainerName, "5", "5", "3");
		console.log("setContainerServerStack result:", result); // Log the entire result
		// container spinup test cases//
		// const result = await generateContainerIPandURLandPORT(testContainerName,testJWT,testUname);
		// const result = await dockerImageCreation(testContainerName, "laravel_v10", testJWT);
		
		return json({result});
	} catch (error: any) {
		console.error("API Test Error:", error);
		return json(
			{ error: error instanceof Error ? error.message : "Unknown error occurred" },
			{ status: 500 }
		);
	}
};
