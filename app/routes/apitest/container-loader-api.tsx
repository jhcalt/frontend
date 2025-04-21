import { data, LoaderFunction } from "react-router";
import { getJwtAccess } from "~/utils/auth/cookieUtils";
import { createNewContainer, getAllContainerInfoFromDB } from "~/utils/dashboard/dashboardUtils";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const jwtAccess = getJwtAccess(request);
    if (!jwtAccess) {
      throw new Error("JWT access token is missing.");
    }

    const testUsername = "jugaad";
    const testJwtAccess = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg2NTg0MjIwLCJpYXQiOjE3MzY1ODQyMjAsImp0aSI6IjFmNjE1MTQ1NDdmZTRjZmVhYTgyOTA5YjU5NGQxODA4IiwidXNlcl9pZCI6MTAsInVzZXJuYW1lIjoianVnYWFkIn0.6lg-tiEpZrh7owbbR2DghDVrPguDKmhtsMCVrS-u30k";

    // Get all containers for display
    const containers = await getAllContainerInfoFromDB(testJwtAccess);
    
    return data({ 
      containers, 
      username: testUsername,
      testJwtAccess // passing this for testing purposes
    });

  } catch (error: any) {
    console.error("[loader] Error:", error.message || error);
    return data(
      { error: error.message || "Unexpected error occurred" },
      { status: 500 }
    );
  }
};