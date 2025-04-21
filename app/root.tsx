import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import { redirect } from "react-router";

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  if (url.pathname === "/") {
    return redirect("/auth/login");
  }
  return null;
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap",
  },
];

import "./tailwind.css";

// Remove the Layout component and merge it with App
export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <Outlet />
        </div>
        <div id="portal-container" />  {/* Add this line */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}