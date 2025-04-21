// app/types/dashboard-types.ts
interface DockerImage {
  name: string;
  description: string;
  version: string;
  image_type: 'frontend' | 'backend' | 'database';
}

interface DockerMapping {
  image: DockerImage;
}

interface ContainerSpecs {
  ram: number;
  disk_type: string;
  disk_space: number;
  ram_type: string;
  vcpu: number;
  vcpu_type: string;
  autoscalingmode: boolean;
}

export interface Container {
  name: string;
  url: string;
  created_time: string;
  running: boolean;
  gitlink: string;
  specs: ContainerSpecs;
  docker_mappings: DockerMapping[];
}

export interface DashboardLoaderData {
  containers: Container[];
  username?: string;
  userData?: string;
  noContainers?: boolean;
}
