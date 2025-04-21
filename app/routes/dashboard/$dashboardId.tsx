import { useLoaderData, data, redirect, type LoaderFunctionArgs } from "react-router";
import { getJwtAccess, getUserData, getUsernameFromCookie } from "~/utils/auth/cookieUtils";
import { getIndividualContainerInfo, getUserContainerInfo } from "~/utils/dashboard/dashboardUtils";
import type { Container } from "~/types/dashboard-types";
import DashboardInstancePage from "~/components/Dashboard/DashboardInstance/DashboardInstancePage";
import { getDetailedInfoSingleContainer } from "~/utils/dashboard/dashboardUtils_redis";
import { decodeUrl } from "~/tools/topicEncoderDecoder";

interface ContainerLoaderData {
  containerInfo: Container | null;
  username: string;
  userData: any;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    console.log("$DASHBOARDID LOADER FUNCTION")

    const containerUrl = params.dashboardId?.toString();
    if (!containerUrl) {
      return redirect("/dashboard");
    }
    const {username, topic } = decodeUrl(containerUrl);
    const containerName = topic;

    // const username = getUsernameFromCookie(request);


    console.log("CONTAINER NAME:", containerName);
    const containerInfo = await getDetailedInfoSingleContainer(username, containerName);
    // console.log("CONTAINER INFO:",containerInfo)
    if (!containerName) {
      throw new Response("Container name is required", { status: 400 });
    }

    const jwtAccessToken = await getJwtAccess(request);
    const jwtAccess = jwtAccessToken?.toString();

    if (!jwtAccess) {
      return redirect("/auth/login");
    }

    const userData = await getUserData(request)

    if (!userData) {
      throw new Response("User data not found", { status: 401 });
    }

    if (!containerInfo) {
      throw new Response("Container not found", { status: 404 });
    }

    // console.log("LOADER RETURN: ", {containerInfo, username, userData});

    return data<ContainerLoaderData>({ containerInfo, username, userData });
  } catch (error) {
    console.error("Error in container detail loader:", error);

    if (error instanceof Response) {
      throw error; // Re-throw Responses
    }

    throw new Response("An unexpected error occurred", { status: 500 });
  }
}

export default function DashboardInstanceRoutePage() {
  const { containerInfo, username, userData } = useLoaderData() as ContainerLoaderData;

  if (!containerInfo) {
    return <div>Container not found.</div>;
  }

  return (
    <DashboardInstancePage container={containerInfo} username={username} userData={userData} />
  );
}

export const handle = {
  breadcrumb: (data: ContainerLoaderData) => {
    if (!data?.containerInfo?.name) {
      return null;
    }
    return [
      {
        title: "Dashboard",
        path: "/dashboard",
      },
      {
        title: data.containerInfo.name,
      },
    ];
  },
};
