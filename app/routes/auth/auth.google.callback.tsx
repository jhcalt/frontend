import { LoaderFunction, redirect } from "@remix-run/node";
import { auth } from "~/utils/googleAuth.server";
import { getSession, commitSession } from "~/utils/session.server";
import {decryptText, encryptText, setUserDataCookies} from "~/utils/auth/cookieUtils";

export let loader: LoaderFunction = async ({ request }) => {
    let session = await getSession(request.headers.get("Cookie"));

    try {
        // Authenticate with Google
        let user = await auth.authenticate("google", request);
        console.log("Google User Data:", user);

        // Send user data to Django API
        const response = await fetch(`${process.env.SERVER_API_URL}/auth/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                google_id: user.id,
                email: user.email,
                name: user.name
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Django API Error:", errorText);
            return redirect("/auth/login");
        }

        const responseData = await response.json();
        console.log("Django API Response Data:", responseData);
        const encrypted_username = await encryptText(responseData.username);
        // console.log("decryptText", decryptText(encrypted_username));
        // Store user session with JWT received from Django
        session.set("user", {
            id: responseData.user_id,
            email: responseData.email,
            token: responseData.access, // Store JWT for future requests
        });
        setUserDataCookies(responseData.username, responseData);
        return redirect("/chat", {
            headers: {
                "Set-Cookie": [
                    await commitSession(session),
                    `username=${encrypted_username}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600`,
                ],
            },
        });
    } catch (error) {e
        console.error("Error during Google login:", error);
        return redirect("/auth/login");
    }
};