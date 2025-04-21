import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/_index.tsx"),

	//Auth
	route("auth/login", "routes/auth/login.tsx"),
	route("auth/signup", "routes/auth/signup.tsx"),

	//Chat
	route("/chat", "routes/chat/index.tsx"),
	route("/chat/:chatId", "routes/chat/$chatId.tsx"),

	//Dashboard
	route("/dashboard", "routes/dashboard/index.tsx"),
	route("/dashboard/:dashboardId", "routes/dashboard/$dashboardId.tsx"),

	//Resources
	route("/resources/chatinput-actions", "routes/resources/chatinput-actions.ts"),
	route("/resources/chatmaininput-actions", "routes/resources/chatmaininput-actions.ts"),
	route("/resources/sidebar-actions", "routes/resources/sidebar-actions.ts"),
	//Resources-Github
	route("/resources/github/github-repo-actions", "routes/resources/github/github-repo-actions.ts"),

	//Api Tests
	route("/apitest", "routes/apitest/index.tsx"),
	route("/apitest/testapi2", "routes/apitest/testapi2.tsx"),
	route("/uitest", "routes/apitest/apiTest.tsx"),
	route("/auth/google", "routes/auth/auth.google.tsx"),
	route("/auth/google/callback", "routes/auth/auth.google.callback.tsx"),




] satisfies RouteConfig;