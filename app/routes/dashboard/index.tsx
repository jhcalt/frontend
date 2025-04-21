import {  type LoaderFunctionArgs, data, redirect } from "react-router";
import { useLoaderData } from "react-router";
import { DashboardHomeInterface } from "~/components/Dashboard/DashboardHomeInterface";
import type { Container } from "~/types/dashboard-types";
import { getJwtAccess, getUsernameFromCookie, getUserData } from "~/utils/auth/cookieUtils";
import { getUserContainerInfo } from "~/utils/dashboard/dashboardUtils";
import { getAllContainersCardInfo } from "~/utils/dashboard/dashboardUtils_redis";

export interface DashboardLoaderData {
  containers: Container[] | null;
  username: string;
  userData: object;
  noContainers: boolean;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const jwtAccessToken = await getJwtAccess(request);
    const jwtAccess = jwtAccessToken?.toString();

    // if (!jwtAccess) {
    //   return redirect("/auth/login");
    // }
    const username = await getUsernameFromCookie(request);
    if (!username) {
      return redirect("/auth/login");
    }
    // Get rest of the data
    const [userData, containerInfo] = await Promise.all([
      getUserData(request),
      getUserContainerInfo(username, jwtAccess as string), // Pass username to getUserContainerInfo
    ]);

    if (!userData) {
      throw new Response("User data not found", { status: 401 });
    }

    // Check if containerInfo is null (no containers deployed)
    if (containerInfo === null) {
      return data<DashboardLoaderData>({
        containers: [],
        username,
        userData,
        noContainers: true
      });
    }

    const containers = await getAllContainersCardInfo(username);

    return data<DashboardLoaderData>({
      containers,
      username,
      userData,
      noContainers: false
    });
  } catch (error) {
    console.error('Error in dashboard loader:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw new Response("Error loading dashboard data", { status: 500 });
  }
}

export default function DashboardRoutePage() {
  const { containers, username, userData, noContainers } = useLoaderData() as DashboardLoaderData;

  return (
    <DashboardHomeInterface
      containers={containers || []}
      username={username}
      userData={userData}
      noContainers={noContainers}
    />
  );
}

export const handle = {
  breadcrumb: {
    title: "Dashboard",
    path: "/dashboard",
  },
};
