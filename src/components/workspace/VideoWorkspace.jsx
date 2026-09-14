import React from 'react';
import { useVideo } from '../../context/VideoContext';
import WorkspaceHeader from './WorkspaceHeader';
import OverviewTab from './OverviewTab';
import StoryboardTab from './StoryboardTab';
import VersionsTab from './VersionsTab';
import CharactersTab from './CharactersTab';
import PromptsTab from './PromptsTab';
import TimelineTab from './TimelineTab';
import ScriptTab from './ScriptTab';
import PlatformsTab from './PlatformsTab';
import AssetsTab from './AssetsTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'script', label: 'Script & Screenplay' },
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'versions', label: 'Storyboard Versions' },
  { id: 'characters', label: 'Characters' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'timeline', label: 'Generation Timeline' },
  { id: 'platforms', label: 'Platforms & Reviews' },
  { id: 'assets', label: 'Assets' }
];

export default function VideoWorkspace() {
  const { videos, currentVideoId, activeTab, setActiveTab } = useVideo();

  const video = videos[currentVideoId];

  if (!video) {
    return (
      <div className="empty-state">
        Video project not found.
      </div>
    );
  }

  const getTabBadge = (id) => {
    if (id === 'script' || id === 'storyboard') return video.shots?.length || 0;
    if (id === 'versions') return video.versions?.length || 0;
    if (id === 'characters') return video.characters?.length || 0;
    if (id === 'prompts') return video.prompts?.length || 0;
    if (id === 'timeline') return video.queue?.length || 0;
    if (id === 'platforms') return video.platforms?.length || 0;
    if (id === 'assets') return video.assets?.length || 0;
    return null;
  };

  return (
    <div>
      <WorkspaceHeader video={video} />

      <div className="pipeline">
        {TABS.map((tab) => {
          const count = getTabBadge(tab.id);
          const isCurrent = activeTab === tab.id;

          return (
            <div
              key={tab.id}
              className={`pipeline-step ${isCurrent ? 'current' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              {count !== null && count > 0 && (
                <span className="badge-count">{count}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="tab-content-area">
        {activeTab === 'overview' && <OverviewTab video={video} />}
        {activeTab === 'script' && <ScriptTab video={video} />}
        {activeTab === 'storyboard' && <StoryboardTab video={video} />}
        {activeTab === 'versions' && <VersionsTab video={video} />}
        {activeTab === 'characters' && <CharactersTab video={video} />}
        {activeTab === 'prompts' && <PromptsTab video={video} />}
        {activeTab === 'timeline' && <TimelineTab video={video} />}
        {activeTab === 'platforms' && <PlatformsTab video={video} />}
        {activeTab === 'assets' && <AssetsTab video={video} />}
      </div>
    </div>
  );
}
