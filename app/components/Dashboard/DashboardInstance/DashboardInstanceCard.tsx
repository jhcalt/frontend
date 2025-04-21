import { FC } from 'react';
import { GitBranch, MoreHorizontal, Play, StopCircle } from 'lucide-react';
import type { Container } from '~/types/dashboard-types';
import { generateContainerUrl } from '~/utils/urlUtils';

interface InstanceCardProps {
  username: string;
  container: Container | null;
}

const DashboardInstanceCard: FC<InstanceCardProps> = ({ username, container }) => {
  if (!container) {
    return (
      <div className="block bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">No container data available</p>
        </div>
      </div>
    );
  }

  const { name = 'Unnamed', gitlink = '', created_time, running = false } = container;

  // Create URL-safe slug from container name
  const slug = generateContainerUrl(username, container.name);

  // Format the date with fallback
  const formattedDate = created_time
    ? new Date(created_time).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Date not available';

  // Extract repo path from gitlink with fallback
  const repoPath = gitlink ? (gitlink.split('github.com/')[1] || gitlink) : 'No repository linked';

  return (
    <div className="relative group block bg-white p-6 border border-border rounded-lg transition-colors shadow-md hover:shadow-lg animate-spring-in">
  <div className="flex items-start justify-between">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
        <span className="text-primary font-semibold text-lg font-tiempos">
          {name.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>
      <div>
        <h3 className="font-medium text-grey font-tiempos text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground truncate max-w-[220px] font-future">
          {repoPath}
        </p>
      </div>
    </div>
    <button
      className="text-muted-foreground hover:text-grey transition-colors p-2 rounded-full hover:bg-muted"
      onClick={(e) => e.preventDefault()}
      aria-label="More options"
    >
      <MoreHorizontal className="w-5 h-5 text-icon" />
    </button>
  </div>
  
  <div className="mt-5 space-y-2.5 font-future">
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <GitBranch className="w-4 h-4 text-icon" />
      <span>{repoPath}</span>
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
      <div>
        <span className="block text-xs text-grey">vCPU</span>
        {container.specs?.vcpu || 'N/A'}
      </div>
      <div>
        <span className="block text-xs text-grey">RAM</span>
        {container.specs?.ram || 'N/A'} GB
      </div>
    </div>

    <div className="flex items-center mt-3">
      <span className="text-sm text-grey font-medium mr-2">Status:</span>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          running ? 'bg-[#22c55e] text-white' : 'bg-destructive text-white'
        }`}
      >
        {running ? 'Running' : 'Stopped'}
      </span>
    </div>
  </div>
  
  {/* Action buttons on hover */}
  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1.5">
    <button
      className="p-1.5 rounded-full bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-destructive transition-colors"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Add stop logic here */ }}
      aria-label="Stop"
    >
      <StopCircle className="w-4 h-4" />
    </button>
    <button
      className="p-1.5 rounded-full bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-primary transition-colors"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Add restart logic here */ }}
      aria-label="Restart"
    >
      <Play className="w-4 h-4" />
    </button>
  </div>
</div>  );
};

export default DashboardInstanceCard;
