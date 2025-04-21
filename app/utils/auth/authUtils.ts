// File: app/utils/authUtils.tsx
import { getJwtAccess } from './cookieUtils';

export async function apiSignupPost(payload: Record<string, any>) {
  try {
    const endpoint = `${process.env.SERVER_API_URL}${process.env.SIGNUP_API_URL}`;
    console.log(endpoint);
    
    console.log("Sending signup request to:", endpoint, "with payload:", payload);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Check if the response is a success (201 Created)
    if (response.status === 201) {
      const responseData = await response.json();
      console.log("[authUtils.tsx] Signup API Response Data:", responseData);
      return responseData; // return success response
    } else {
      const errorDetails = await response.json();
      console.error("Signup API Error :", errorDetails);
      throw new Error(errorDetails.message || response.statusText);
    }
  } catch (error: any) {
    console.error("[authUtils.tsx] Error in apiSignupPost function:", error);
    throw new Error(error.message || "Something went wrong during signup.");
  }
}


export async function apiLoginPost(payload: Record<string, any>) {
  try {
    const endpoint = `${process.env.SERVER_API_URL}${process.env.LOGIN_API_URL}`;
    
    // If we receive encrypted data from the client, decode it
    let loginData = payload;
    if (payload.encryptedData) {
      try {
        // Decode the base64 string back to JSON
        const decodedData = JSON.parse(atob(payload.encryptedData));
        loginData = {
          username: decodedData.username,
          password: decodedData.password
        };
      } catch (error) {
        console.error("Error decoding encrypted data:", error);
        throw new Error("Invalid login data format");
      }
    }
    
    // Don't log sensitive information in production
    if (process.env.NODE_ENV !== 'production') {
      console.log("Sending login request to:", endpoint, "with payload type:", typeof loginData);
    }
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("Login API Error:", errorDetails);
      throw new Error(errorDetails.message || response.statusText);
    }

    const responseData = await response.json();
    console.log("Login API Response Data:", responseData);
    return responseData;
  } catch (error: any) {
    console.error("Error in apiLoginPost:", error);
    throw new Error(error.message || "Something went wrong during login.");
  }
}


// File: app/utils/authUtils.ts

/**
 * Checks if the user is authenticated based on the presence of a valid JWT access token.
 * @param {Request} request - The request object containing the cookies.
 * @returns {boolean} - True if the user is authenticated, false otherwise.
 */
export const isAuthenticated = (request: Request): boolean => {
  const accessToken = getJwtAccess(request);
  // Here you can add additional validation for the access token if necessary
  return Boolean(accessToken);
};
