/*TODO:
- default /chat page before login/signup
- deployed undeployed marking
- transition animations
- dashboard instance page cleanup
- navbar profile icon dynamic + layout page optimization
- chat rt streaming
- new chat name will be the first 5 words
- github data in /chat loader for fast response
- customevent listerner for dockerResponse
- repoName in $chatid loader
*/

/*BUGS
- ui cleanup 2 (chat sidebar, fontsizes)
- problem in dockerresponse loading
- no user dashboard no redirect
*/

/*AVINIERNOTES:
- IMPORTANT: ignore typsecript string | undefined error and implicitly any type error
- IMPORTANT: do not use 'react-router-dom'
 */

import { ActionFunction, data } from "react-router";
import { Form, useActionData, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { faGoogle as faGoogleBrand } from '@fortawesome/free-brands-svg-icons';
import { apiLoginPost } from "~/utils/auth/authUtils";
import { setUserDataCookies, encryptText } from "~/utils/auth/cookieUtils";

type ActionData = {
  success?: string;
  error?: string;
  access?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const encryptedData = formData.get("encryptedData") as string | null;
  
  if (!encryptedData) {
    return data({ error: "Login data is required." }, { status: 400 });
  }

  try {
    // The data is already encrypted on the client side, we just need to pass it to the API
    const response = await apiLoginPost({ encryptedData });

    if (response?.access) {
      const cookies = setUserDataCookies(response.username, response);
      const encrpted_username = await encryptText(response.username);
      return data(
        { success: "Login successful!", access: response.access },
        {
          headers: {
            "Set-Cookie": `username=${encrpted_username}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600`,
          },
        }
      );
    } else {
      return data({ error: response.message || "Invalid credentials." }, { status: 401 });
    }
  } catch (error: any) {
    return data({ error: error.message || "Something went wrong." }, { status: 500 });
  }
};

// Client-side encryption function
const encryptClientData = (data: { username: string; password: string }) => {
  // Simple encryption for client-side (this is just obfuscation)
  // In a real-world scenario, you might use a more robust approach like Web Crypto API
  return btoa(JSON.stringify(data));
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setMessage({
          text: actionData.success,
          type: "success",
        });
        setTimeout(() => {
          navigate("/chat");
        }, 200);
      } else if (actionData.error) {
        setMessage({
          text: actionData.error,
          type: "error",
        });
      }
    }
  }, [actionData, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4 py-8 sm:px-6 md:py-12">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center text-gray-800">Sign-In</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">Welcome back, you've been missed!</p>

        <Form method="post" className="space-y-4 sm:space-y-6" onSubmit={(e) => {
          e.preventDefault();
          
          try {
            // Encrypt the form data before submission
            const encryptedData = encryptClientData(formData);
            
            // Create a hidden input field with the encrypted data
            const hiddenField = document.querySelector('input[name="encryptedData"]') as HTMLInputElement;
            if (hiddenField) {
              hiddenField.value = encryptedData;
            }
            
            // Submit the form normally to use Remix's built-in form handling
            // This avoids the JSON parsing issues with manual fetch
            e.currentTarget.submit();
          } catch (error) {
            console.error("Error encrypting data:", error);
            setMessage({
              text: "An error occurred while processing your login. Please try again.",
              type: "error",
            });
          }
        }}>
          <div>
            <input
              type="text"
              id="username"
              placeholder="Enter Username"
              className="bg-gray-100 rounded-lg px-3 py-3 sm:px-4 sm:py-4 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 ease-in-out hover:shadow-md hover:bg-gray-50"
              required
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              value={formData.username}
            />
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter Password"
                className="bg-gray-100 rounded-lg px-3 py-3 sm:px-4 sm:py-4 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent pr-10 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-gray-50"
                required
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                value={formData.password}
              />
              <button
                type="button"
                className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </button>
            </div>
          </div>
          
          {/* Hidden field to store encrypted data */}
          <input type="hidden" name="encryptedData" value="" />

          {message && (
            <div>
              <p
                style={{
                  color: message.type === "error" ? "red" : "green",
                  margin: "10px 0",
                }}
              >
                {message.text}
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-tiempos py-3 sm:py-4 px-4 rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:bg-opacity-90 text-sm sm:text-base"
            >
              Sign In
            </button>
          </div>
        </Form>

        <div className="flex flex-col items-center space-y-4 sm:space-y-6 mt-6 sm:mt-8">
          <Link
            to="/auth/google"
            className="w-full bg-white border border-gray-200 font-tiempos text-gray-700 font-bold py-3 sm:py-4 px-4 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 hover:shadow-xl transition-all duration-300 ease-in-out text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faGoogleBrand} className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
            Sign In with Google
          </Link>

          <Link
            to="/auth/signup"
            className="text-primary hover:underline text-center transition-all duration-300 ease-in-out text-sm sm:text-base"
          >
            Not a member? Signup now
          </Link>
        </div>
      </div>
    </div>
  );
}
