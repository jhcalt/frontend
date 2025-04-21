import { FC, useState } from "react";
import type { Container } from "~/types/dashboard-types";
import DashboardNavbar from "~/components/Dashboard/DashboardNavbar";
import {
  Link as GitLinkIcon,
  Cpu,
  HardDrive,
  Database,
  MapPin,
  Github,
} from "lucide-react";
import Navbar from "~/components/UI/Navbar";
import InstanceSecurityCheck from "./InstanceSecurityCheck";
import InstanceCostAnalyzer from "./InstanceCostAnalyzer";

interface DashboardInstanceDetailsProps {
  container: Container;
  username: string;
  userData: string;
}

const DashboardInstancePage: FC<DashboardInstanceDetailsProps> = ({
  container,
  username,
  userData,
}) => {
  if (!container) {
    return <div>No container data available.</div>;
  }

  const {
    name,
    gitlink,
    created_time,
    running,
    specs,
    docker_mappings,
    region,
  } = container;
  const {
    ram,
    disk_type,
    disk_space,
    ram_type,
    vcpu,
    vcpu_type,
    autoscalingmode,
  } = specs || {};

  const formattedDate = created_time
    ? new Date(created_time).toLocaleString()
    : "N/A";

  // Placeholder data for meeting details (replace with actual data when available)
  const meet = {
    title: "Meeting Title",
    link: "https://meet.google.com",
    videoId: "1OSI5KdGhIDepr8a_peyJZIX6lKmOge8F", // Placeholder video ID
    members: [
      { name: "mem1", image: "/logo-dark.png" },
      { name: "mem2", image: "/logo-dark.png" },
      { name: "mem3", image: "/logo-dark.png" },
    ],
    date: formattedDate,
  };

  // Placeholder data for tasks (replace with actual data when available)
  const todos = [
    { id: 1, text: "Add graphs in dashboard", completed: false },
    { id: 2, text: "Review pull requests", completed: false },
    { id: 3, text: "Update dependencies", completed: true },
    { id: 4, text: "Database tuning", completed: false },
  ];

  const [tasks, setTasks] = useState(todos);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task: { id: number; text: string; completed: boolean }) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar userData={userData} />
      <DashboardNavbar username={username} userData={userData} />
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Main content area with two-column layout */}
        <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Server Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold">{name}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                    running
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {running ? "Running" : "Stopped"}
                </span>
              </div>
              <p className="text-gray-600">Placeholder description</p>{" "}
              {/* TODO: Add description to Container type */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <a
                  href={container.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                >
                  <GitLinkIcon size={20} />
                  <span className="truncate max-w-[200px] sm:max-w-none">{container.url || "N/A"}</span>
                </a>
                <a
                  href={gitlink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-800 text-sm sm:text-base"
                >
                  <Github size={20} />
                  <span>View on GitHub</span>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Cpu className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">CPU</p>
                      <p className="font-medium">{vcpu || "N/A"} Cores</p>
                    </div>
                  </div>
                  {/* CPU Blocks */}
                  <div className="flex gap-1 mt-2">
                    {[...Array(Number(vcpu) || 0)].map((_, index) => (
                      <div
                        key={index}
                        className={`h-4 w-4 rounded ${
                          index < Math.round(((Number(vcpu) || 0) / 8) * 8)
                            ? "bg-blue-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Database className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Memory</p>
                      <p className="font-medium">{ram || "N/A"} GB</p>
                    </div>
                  </div>
                  {/* Memory Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((Number(ram) || 0) / 16) * 100
                        )}%`, // Assuming a max of 16GB RAM, adjust as needed
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {ram || 0}GB / 16GB{" "}
                    {/* Assuming a max of 16GB RAM, adjust as needed */}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{region || "N/A"}</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <HardDrive className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Storage</p>
                      <p className="font-medium">{disk_space || "N/A"} GB</p>
                    </div>
                  </div>
                  {/* Storage Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((Number(disk_space) || 0) / 256) * 100
                        )}%`, // Assuming max 256 GB, adjust as needed
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {disk_space || 0}GB / 256GB{" "}
                    {/* Assuming max 256 GB, adjust as needed */}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {docker_mappings &&
                    docker_mappings.map((mapping) => (
                      <span
                        key={mapping.image.name}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {mapping.image.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Meeting Details */}
          <div className="space-y-6">
            {/* <InstanceSecurityCheck containerName={name} /> */}
          </div>
        </div>
        {/* <InstanceCostAnalyzer containerName={name} /> */}
      </main>
    </div>
  );
};

export default DashboardInstancePage;
