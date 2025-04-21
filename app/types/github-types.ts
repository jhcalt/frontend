export interface GitHubResponseData {
    githubUsername: string;
    repoData: RepoData[];
}
export interface RepoData {
    name: string;
    visibility: 'public' | 'private';
    last_push: string;
}

export interface UiRepo {
    name: string;
    icon?: string;
    private: boolean;
    lastUpdated: string;
  }
  