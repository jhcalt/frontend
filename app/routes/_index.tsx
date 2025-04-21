import { Link } from "react-router";
import type { RouteHandle } from "../types/ui-types";

export const handle: RouteHandle = {
  breadcrumb: {
    title: "Home",
    path: "/",
  },
};

export default function Index() {
  return (
    <>
      <h1>Mainpage</h1>
      <p>
        <Link to="/auth/login">Login</Link> or{" "}
        <Link to="/auth/signup">Signup</Link> to get started.
      </p>
    </>
  );
}
