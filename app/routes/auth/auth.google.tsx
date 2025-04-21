import { LoaderFunction, redirect } from "@remix-run/node";
import { auth } from "~/utils/googleAuth.server";
import { getSession, destroySession, commitSession } from "~/utils/session.server";

export let loader: LoaderFunction = async ({ request }) => {
    let session = await getSession(request.headers.get("Cookie"));

    // If session exists, destroy it and redirect first
    if (session.has("user")) {
        let headers = new Headers();
        headers.append("Set-Cookie", await destroySession(session));

        // Redirect to a temporary page to ensure session is fully cleared
        return redirect("/auth/google", { headers });
    }

    // Start Google authentication
    return await auth.authenticate("google", request, {
        successRedirect: "/dashboard",
        failureRedirect: "/auth/login",
    });
};
