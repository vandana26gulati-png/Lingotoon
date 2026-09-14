import React from 'react';
import { useVideo } from './context/VideoContext';
import Sidebar from './components/layout/Sidebar';
import ToastContainer from './components/layout/Toast';
import VideoGrid from './components/videos/VideoGrid';
import VideoWorkspace from './components/workspace/VideoWorkspace';
import CreditsDashboard from './components/credits/CreditsDashboard';
import FlyingBird from './components/common/FlyingBird';

export default function App() {
  const { topView } = useVideo();

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        {topView === 'videos' && <VideoGrid />}
        {topView === 'workspace' && <VideoWorkspace />}
        {topView === 'credits' && <CreditsDashboard />}
      </main>

      <FlyingBird />
      <ToastContainer />
    </div>
  );
}
