import { createCookieSessionStorage } from "@remix-run/node";

export let sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        secrets: [process.env.SESSION_SECRET!],
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    },
});

export let { getSession, commitSession, destroySession } = sessionStorage;
