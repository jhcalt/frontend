export async function responseLogging(
  response: Response, 
  fileName: string, 
  apiName: string,
  logging: boolean
) {
  try {
      const responseData = await response.json();
      
      if (!response.ok) {
          console.error(`${fileName} ${apiName} Error:`, {
              status: response.status,
              statusText: response.statusText,
              error: responseData
          });
          throw new Error(responseData.detail || responseData.error || response.statusText);
      }

      if (process.env.NODE_ENV === 'development' && logging) {
          console.log(`${fileName} ${apiName} Response Data:`, responseData);
      }
      
      return responseData;
  } catch (error) {
      console.error(`${fileName} ${apiName} ERR processing response:`, error);
      throw error;
  }
}

export async function apiFunction(
  endpoint: string,
  methodName: string,
  jwtAccess: string,
  payload?: { [key: string]: any }
): Promise<Response> {
  try {
      // Validate inputs
      if (!endpoint || !methodName || !jwtAccess) {
          throw new Error("Missing required parameters for API call");
      }

      // Clean the JWT token
      const cleanToken = jwtAccess.replace(/^"(.*)"$/, '$1').trim();

      // Define headers with proper Bearer token format
      const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cleanToken}` // Added space after Bearer
      };

      // Initialize request options
      const options: RequestInit = {
          method: methodName,
          headers,
          credentials: 'include' // Include credentials for cross-origin requests if needed
      };

      // Add body for non-GET methods
      if (methodName !== "GET" && payload) {
          options.body = JSON.stringify(payload);
      }

      // Debug logging in development
    //   if (process.env.NODE_ENV === 'development') {
    //       console.log('[API Request]', {
    //           endpoint,
    //           method: methodName,
    //           headers,
    //           payload: methodName !== "GET" ? payload : undefined
    //       });
    //   }

      // Execute the fetch request
      const response = await fetch(endpoint, options);

      // console.log('[API Response]', { status: response.status, statusText: response.statusText});


      return response;
  } catch (error) {
      console.error('[apiFunction Error]', {
          endpoint,
          method: methodName,
          error
      });
      throw error;
  }
}