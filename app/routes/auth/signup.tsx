import { ActionFunction, data } from "react-router";
import { useState, useEffect } from "react";
import { Form, useActionData, Link, useNavigate } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { faGoogle as faGoogleBrand } from '@fortawesome/free-brands-svg-icons';
import { apiSignupPost, apiLoginPost } from "~/utils/auth/authUtils";
import { setUserDataCookies, encryptText } from "~/utils/auth/cookieUtils";

type ActionData = {
  success?: string;
  error?: string;
} | undefined;

export const action: ActionFunction = async ({ request }) => {
  console.log("Action function triggered");

  const formData = await request.formData();
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;
  const username = formData.get("username") as string | null;

  console.log("Form Data:", { email, username, password });

  // Validation
  if (!email || !password || !confirmPassword || !username) {
    console.log("Validation failed: Missing required fields");
    return { error: "All fields are required." };
  }
  if (password !== confirmPassword) {
    console.log("Validation failed: Passwords do not match");
    return { error: "Passwords do not match." };
  }

  try {
    console.log("Attempting signup API call");
    const signupResponse = await apiSignupPost({
      email,
      username,
      password,
    });
    console.log("Signup API Response:", signupResponse);

    if (signupResponse) {
      console.log("Signup successful");
      
      const login_response = await apiLoginPost({ username, password });
      if (login_response?.access) {
        const cookies = setUserDataCookies(username,login_response);

        const encrpted_username = await encryptText(username);

        return data(
          { success: "Login successful!", access: login_response.access },
          {
            headers: {
            "Set-Cookie": `username=${encrpted_username}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600`,
            },
          }
        );
      } else {
        return data({ error: login_response.message || "Invalid credentials." }, { status: 401 });
      }
    }

    return { error: "Failed to sign up. Please try again." };
  } catch (error: any) {
    console.error("Error during signup:", error);
    return { error: error.message || "An error occurred during signup." };
  }
};

export default function Signup() {
  const actionData = useActionData<ActionData>();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setMessage({ text: actionData.success, type: "success" });

        // Redirect to the login page after 2 seconds
        const timer = setTimeout(() => {
          navigate("/chat");
        }, 2000);

        return () => clearTimeout(timer);
      } else if (actionData.error) {
        setMessage({ text: actionData.error, type: "error" });
      }
    }
  }, [actionData, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4 py-8 sm:px-6 md:py-12">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center text-gray-800">Sign Up</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">Create your account and join us!</p>
        
        <Form method="post" className="space-y-4 sm:space-y-6">
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email"
              className="bg-gray-100 rounded-lg px-3 py-3 sm:px-4 sm:py-4 w-full 
                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent 
                transition-all duration-300 ease-in-out 
                hover:shadow-md hover:bg-gray-50"
              required
            />
          </div>
          <div>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter Username"
              className="bg-gray-100 rounded-lg px-3 py-3 sm:px-4 sm:py-4 w-full 
                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent 
                transition-all duration-300 ease-in-out 
                hover:shadow-md hover:bg-gray-50"
              required
            />
          </div>
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create Password"
                className="bg-gray-100 rounded-lg px-3 py-3 sm:px-4 sm:py-4 w-full 
                  focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent 
                  pr-10 transition-all duration-300 ease-in-out 
                  hover:shadow-md hover:bg-gray-50"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="text-sm sm:text-base" />
              </button>
            </div>
            <div className="relative mt-4 sm:mt-6">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="bg-gray-100 rounded-lg px-3 py-3 sm:px-4 sm:py-4 w-full 
                  focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent 
                  pr-10 transition-all duration-300 ease-in-out 
                  hover:shadow-md hover:bg-gray-50"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="text-sm sm:text-base" />
              </button>
            </div>
          </div>

          {message && (
            <p className={`text-center mb-4 text-sm sm:text-base ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
              {message.text}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="w-full bg-secondary text-white py-3 sm:py-4 px-4 rounded-lg 
                transition-all duration-300 ease-in-out 
                hover:shadow-lg hover:bg-opacity-90
                text-sm sm:text-base"
            >
              Sign Up
            </button>
          </div>
        </Form>
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 mt-6 sm:mt-8">
          <Link
            to="/auth/google"
            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 sm:py-4 px-4 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 hover:shadow-xl transition-all duration-300 ease-in-out text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faGoogleBrand} className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
            Sign Up with Google
          </Link>
          <Link
            to="/auth/login"
            className="text-secondary hover:underline text-center transition-all duration-300 ease-in-out text-sm sm:text-base"
          >
            Already a member? Login in here
          </Link>
        </div>
      </div>
    </div>
  );
}
