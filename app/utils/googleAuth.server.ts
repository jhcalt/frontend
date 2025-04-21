import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { sessionStorage } from "~/utils/session.server";

export let auth = new Authenticator(sessionStorage);

auth.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_REDIRECT_URI!,
}, async ({ profile }) => {
    return { id: profile.id, email: profile.emails[0].value, name: profile.displayName };
}));
