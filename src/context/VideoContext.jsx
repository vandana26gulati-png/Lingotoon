import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_VIDEOS, TOOL_OPTIONS } from '../data/initialData';

const VideoContext = createContext();

const STORAGE_KEY = 'lingotoon_studio_clean_v3';

export function VideoProvider({ children }) {
  const [videos, setVideos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage, using clean initial data.', e);
    }
    return INITIAL_VIDEOS;
  });

  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [topView, setTopView] = useState('videos'); // 'videos' | 'workspace' | 'credits'
  const [activeTab, setActiveTab] = useState('overview');
  const [toasts, setToasts] = useState([]);

  // Auto-save to localStorage whenever videos change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [videos]);

  const addToast = (text, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openVideo = (id) => {
    if (videos[id]) {
      setCurrentVideoId(id);
      setTopView('workspace');
      setActiveTab('overview');
    }
  };

  // ------------------ Video Operations ------------------
  const createVideo = ({ title, epLabel, logline, createdBy, cover }) => {
    const id = 'ep_' + Date.now();
    const newVideo = {
      id,
      epLabel: epLabel || `Episode ${Object.keys(videos).length + 1}`,
      title: title || 'Untitled Production',
      cover: cover || 'Concept art thumbnail',
      status: 'draft',
      createdBy: createdBy || 'You',
      createdDate: new Date().toISOString().split('T')[0],
      logline: logline || 'New animated video project folder.',
      shots: [
        {
          id: 's_' + Date.now(),
          desc: 'Establishing shot for new episode.',
          camera: 'Wide shot',
          chars: '',
          duration: '3s',
          status: 'draft',
          rec: '',
          recReason: '',
          pic: null
        }
      ],
      versions: [
        {
          version: 1,
          date: new Date().toISOString().split('T')[0],
          uploadedBy: createdBy || 'You',
          shotCount: 1,
          status: 'draft',
          approvedBy: '—',
          notes: 'Initial project setup.',
          snapshot: ['Establishing shot']
        }
      ],
      characters: [],
      prompts: [],
      queue: [],
      timeline: [
        {
          id: 't_' + Date.now(),
          date: 'Today · Just now',
          title: 'Project folder created',
          who: createdBy || 'You'
        }
      ],
      platforms: [],
      assets: []
    };

    setVideos(prev => ({ ...prev, [id]: newVideo }));
    setCurrentVideoId(id);
    setTopView('workspace');
    setActiveTab('storyboard');
    addToast(`Created project "${newVideo.title}"!`, 'success');
  };

  const updateVideoDetails = (id, updates) => {
    setVideos(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          ...updates
        }
      };
    });
    addToast('Video details updated.', 'success');
  };

  const deleteVideo = (id) => {
    setVideos(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setTopView('videos');
    addToast('Video folder deleted.', 'info');
  };

  // ------------------ Storyboard Operations ------------------
  const addShot = (videoId) => {
    const shotNum = (videos[videoId]?.shots.length || 0) + 1;
    const newShot = {
      id: 's_' + Date.now() + Math.random().toString(36).substr(2, 4),
      desc: `Shot ${shotNum} — describe action, camera blocking, and lighting.`,
      camera: 'Wide shot',
      chars: '',
      duration: '3s',
      status: 'draft',
      rec: '',
      recReason: '',
      pic: null
    };

    setVideos(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        shots: [...prev[videoId].shots, newShot]
      }
    }));
    addToast(`Shot ${shotNum} added to storyboard.`, 'info');
  };

  const updateShot = (videoId, index, updates) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const shots = [...target.shots];
      const updatedShot = { ...shots[index], ...updates };
      shots[index] = updatedShot;

      // Automatically sync compiled prompt if one exists
      let updatedPrompts = [...(target.prompts || [])];
      const promptIdx = updatedPrompts.findIndex(p => p.shot === index + 1);
      if (promptIdx >= 0) {
        const lockedChars = (target.characters || []).filter(c => c.tag === 'Locked');
        const charRefStr = lockedChars.length
          ? ` (featuring ${lockedChars.map(c => `${c.name} [${c.desc}]`).join(', ')})`
          : '';
        const dialStr = updatedShot.dialogue ? ` Dialogue line: "${updatedShot.dialogue}".` : '';
        updatedPrompts[promptIdx] = {
          ...updatedPrompts[promptIdx],
          text: `${updatedShot.camera}: ${updatedShot.desc}${charRefStr}.${dialStr} Cinematic animation art style, ${updatedShot.duration}.`
        };
      }

      // Automatically sync active queue items in timeline
      let updatedQueue = [...(target.queue || [])];
      updatedQueue = updatedQueue.map((q) => {
        if (q.shot && q.shot.startsWith(`Shot ${index + 1}`)) {
          return {
            ...q,
            shot: `Shot ${index + 1} — ${updatedShot.desc.slice(0, 24)}…`
          };
        }
        return q;
      });

      return {
        ...prev,
        [videoId]: { ...target, shots, prompts: updatedPrompts, queue: updatedQueue }
      };
    });
  };

  const setShotStatus = (videoId, index, status, recReason = '', recNotes = '') => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const shots = [...target.shots];
      const shot = { ...shots[index], status };
      if (status === 'rejected') {
        shot.recReason = recReason;
        shot.rec = recNotes;
      } else if (status === 'approved') {
        shot.rec = '';
        shot.recReason = '';
      }
      shots[index] = shot;

      // When approved, auto-generate or update a prompt in the prompts array
      let updatedPrompts = [...target.prompts];
      if (status === 'approved') {
        // synthesize prompt from shot + locked characters
        const lockedChars = (target.characters || []).filter(c => c.tag === 'Locked');
        const charRefStr = lockedChars.length
          ? ` (featuring ${lockedChars.map(c => `${c.name} [${c.desc}]`).join(', ')})`
          : '';
        const promptText = `${shot.camera}: ${shot.desc}${charRefStr}. Cinematic lighting, animation art style, ${shot.duration}.`;

        const existingPromptIdx = updatedPrompts.findIndex(p => p.shot === index + 1);
        if (existingPromptIdx >= 0) {
          updatedPrompts[existingPromptIdx] = {
            ...updatedPrompts[existingPromptIdx],
            status: 'approved',
            text: promptText
          };
        } else {
          updatedPrompts.push({
            id: 'p_' + Date.now(),
            shot: index + 1,
            tool: 'Runway Gen-4',
            status: 'approved',
            text: promptText
          });
        }
      }

      return {
        ...prev,
        [videoId]: {
          ...target,
          shots,
          prompts: updatedPrompts
        }
      };
    });

    if (status === 'approved') {
      addToast(`Shot ${index + 1} approved! Auto-drafted AI prompt.`, 'success');
    } else if (status === 'rejected') {
      addToast(`Shot ${index + 1} flagged for revision.`, 'info');
    }
  };

  const moveShot = (videoId, index, dir) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const shots = [...target.shots];
      const nextIdx = index + dir;
      if (nextIdx < 0 || nextIdx >= shots.length) return prev;
      const temp = shots[index];
      shots[index] = shots[nextIdx];
      shots[nextIdx] = temp;
      return {
        ...prev,
        [videoId]: { ...target, shots }
      };
    });
  };

  const duplicateShot = (videoId, index) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const shots = [...target.shots];
      const dupe = {
        ...shots[index],
        id: 's_' + Date.now(),
        status: 'draft',
        rec: '',
        recReason: ''
      };
      shots.splice(index + 1, 0, dupe);
      return {
        ...prev,
        [videoId]: { ...target, shots }
      };
    });
    addToast(`Duplicated shot ${index + 1}.`, 'info');
  };

  const deleteShot = (videoId, index) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const shots = [...target.shots];
      shots.splice(index, 1);
      return {
        ...prev,
        [videoId]: { ...target, shots }
      };
    });
    addToast('Shot removed.', 'info');
  };

  const saveNewVersion = (videoId, notes = '', frontImage = null) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const nextNum = (target.versions[0]?.version || 0) + 1;
      const newVersion = {
        version: nextNum,
        date: new Date().toISOString().split('T')[0],
        uploadedBy: 'You',
        shotCount: target.shots.length,
        status: 'draft',
        approvedBy: '—',
        notes: notes || 'Published snapshot from live storyboard.',
        frontImage: frontImage || target.storyboardCover || target.shots[0]?.pic || null,
        snapshot: target.shots.map(s => s.desc.slice(0, 30) + (s.desc.length > 30 ? '…' : ''))
      };

      const timelineItem = {
        id: 't_' + Date.now(),
        date: 'Today · Just now',
        title: `Storyboard v${nextNum} snapshot saved`,
        who: 'You'
      };

      return {
        ...prev,
        [videoId]: {
          ...target,
          versions: [newVersion, ...target.versions],
          timeline: [timelineItem, ...target.timeline]
        }
      };
    });
    addToast('New storyboard version archived!', 'success');
  };

  const restoreVersion = (videoId, versionObj) => {
    // Regenerate shot list from version snapshots
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const restoredShots = versionObj.snapshot.map((snap, idx) => ({
        id: 's_restored_' + Date.now() + '_' + idx,
        desc: snap,
        camera: 'Wide shot',
        chars: '',
        duration: '3s',
        status: 'draft',
        rec: '',
        recReason: '',
        pic: null
      }));

      const timelineItem = {
        id: 't_' + Date.now(),
        date: 'Today · Just now',
        title: `Restored storyboard v${versionObj.version} into live board`,
        who: 'You'
      };

      return {
        ...prev,
        [videoId]: {
          ...target,
          shots: restoredShots,
          timeline: [timelineItem, ...target.timeline]
        }
      };
    });
    addToast(`Restored storyboard v${versionObj.version} to live board.`, 'info');
  };

  // ------------------ Characters ------------------
  const addCharacter = (videoId, charData) => {
    const newChar = {
      id: 'c_' + Date.now(),
      name: charData.name || 'New Character',
      desc: charData.desc || 'Character visual description',
      tag: charData.tag || 'Draft',
      thumb: charData.thumb || `${charData.name} sheet`
    };

    setVideos(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        characters: [...(prev[videoId].characters || []), newChar]
      }
    }));
    addToast(`Character "${newChar.name}" added.`, 'success');
  };

  const toggleCharacterLock = (videoId, charId) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const characters = target.characters.map(c => {
        if (c.id === charId) {
          const newTag = c.tag === 'Locked' ? 'Draft' : 'Locked';
          return { ...c, tag: newTag };
        }
        return c;
      });
      return {
        ...prev,
        [videoId]: { ...target, characters }
      };
    });
    addToast('Character lock status updated.', 'info');
  };

  const deleteCharacter = (videoId, charId) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      return {
        ...prev,
        [videoId]: {
          ...target,
          characters: target.characters.filter(c => c.id !== charId)
        }
      };
    });
    addToast('Character removed.', 'info');
  };

  // ------------------ Prompts & Generation Queue ------------------
  const updatePrompt = (videoId, promptIndex, updates) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const prompts = [...target.prompts];
      prompts[promptIndex] = { ...prompts[promptIndex], ...updates };
      return {
        ...prev,
        [videoId]: { ...target, prompts }
      };
    });
  };

  const sendPromptToGeneration = (videoId, promptObj) => {
    const toolMeta = TOOL_OPTIONS.find(t => t.name === promptObj.tool) || { defaultCost: 80 };
    const newJobId = 'q_' + Date.now();
    const newJob = {
      id: newJobId,
      shot: `Shot ${promptObj.shot} — ${promptObj.text.slice(0, 24)}…`,
      tool: promptObj.tool || 'Runway Gen-4',
      status: 'generating',
      uploadedTo: '—',
      updated: 'Just now',
      cost: toolMeta.defaultCost
    };

    const timelineItem = {
      id: 't_' + Date.now(),
      date: 'Today · Just now',
      title: `Shot ${promptObj.shot} sent to ${promptObj.tool} (${toolMeta.defaultCost} cr)`,
      who: 'You'
    };

    setVideos(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        queue: [newJob, ...(prev[videoId].queue || [])],
        timeline: [timelineItem, ...(prev[videoId].timeline || [])]
      }
    }));

    addToast(`Sent to ${promptObj.tool} generation queue!`, 'success');

    // Simulate completion after 5 seconds
    setTimeout(() => {
      setVideos(latest => {
        const vid = latest[videoId];
        if (!vid) return latest;
        const queue = vid.queue.map(q => {
          if (q.id === newJobId && q.status === 'generating') {
            return {
              ...q,
              status: 'complete',
              uploadedTo: `Drive / ${vid.epLabel}-Shots / shot0${promptObj.shot}_render.mp4`,
              updated: 'Rendered'
            };
          }
          return q;
        });

        const doneTimeline = {
          id: 't_' + Date.now(),
          date: 'Today · Just now',
          title: `Shot ${promptObj.shot} rendering completed (${promptObj.tool})`,
          who: 'System'
        };

        return {
          ...latest,
          [videoId]: {
            ...vid,
            queue,
            timeline: [doneTimeline, ...vid.timeline]
          }
        };
      });
      addToast(`Shot ${promptObj.shot} rendering finished!`, 'success');
    }, 6000);
  };

  const retryJob = (videoId, jobId) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const queue = target.queue.map(q => {
        if (q.id === jobId) {
          return { ...q, status: 'generating', updated: 'Retrying...' };
        }
        return q;
      });
      return {
        ...prev,
        [videoId]: { ...target, queue }
      };
    });
    addToast('Job re-queued for generation.', 'info');
  };

  const completeJob = (videoId, jobId) => {
    setVideos(prev => {
      const target = prev[videoId];
      if (!target) return prev;
      const queue = target.queue.map(q => {
        if (q.id === jobId) {
          return {
            ...q,
            status: 'complete',
            uploadedTo: `Drive / Output / ${q.shot.replace(/[^a-z0-9]/gi, '_')}.mp4`,
            updated: 'Marked complete'
          };
        }
        return q;
      });
      return {
        ...prev,
        [videoId]: { ...target, queue }
      };
    });
    addToast('Marked job as complete.', 'success');
  };

  // ------------------ Platforms & Reviews ------------------
  const addPlatformUpload = (videoId, uploadData) => {
    const newUpload = {
      id: 'pl_' + Date.now(),
      name: uploadData.name || 'YouTube Shorts',
      date: uploadData.date || new Date().toISOString().split('T')[0],
      status: uploadData.status || 'live',
      rating: uploadData.rating ? parseFloat(uploadData.rating) : null,
      reviews: uploadData.reviews ? parseInt(uploadData.reviews, 10) : 0,
      note: uploadData.note || '',
      link: uploadData.link || '#'
    };

    setVideos(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        platforms: [...(prev[videoId].platforms || []), newUpload]
      }
    }));
    addToast(`Logged upload for ${newUpload.name}.`, 'success');
  };

  const deletePlatformUpload = (videoId, platformId) => {
    setVideos(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        platforms: prev[videoId].platforms.filter(p => p.id !== platformId)
      }
    }));
    addToast('Platform upload record removed.', 'info');
  };

  // ------------------ Assets ------------------
  const addAsset = (videoId, assetData) => {
    const newAsset = {
      id: 'a_' + Date.now(),
      name: assetData.name || 'New Asset',
      desc: assetData.desc || '',
      tag: assetData.tag || 'Concept',
      thumb: assetData.thumb || 'Asset preview'
    };

    setVideos(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        assets: [...(prev[videoId].assets || []), newAsset]
      }
    }));
    addToast(`Asset "${newAsset.name}" uploaded.`, 'success');
  };

  const deleteAsset = (videoId, assetId) => {
    setVideos(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        assets: prev[videoId].assets.filter(a => a.id !== assetId)
      }
    }));
    addToast('Asset removed.', 'info');
  };

  // ------------------ Reset & JSON Export ------------------
  const resetToDemoData = () => {
    if (window.confirm('Reset all video folders, storyboards, and credits to demo data?')) {
      setVideos(INITIAL_VIDEOS);
      setCurrentVideoId('ep1');
      localStorage.removeItem(STORAGE_KEY);
      addToast('Reset to default studio demo data.', 'info');
    }
  };

  const exportDataAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(videos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lingotoon_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Exported studio database to JSON file.', 'success');
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        currentVideoId,
        topView,
        activeTab,
        toasts,
        setTopView,
        setActiveTab,
        openVideo,
        addToast,
        removeToast,
        createVideo,
        updateVideoDetails,
        deleteVideo,
        addShot,
        updateShot,
        setShotStatus,
        moveShot,
        duplicateShot,
        deleteShot,
        saveNewVersion,
        restoreVersion,
        addCharacter,
        toggleCharacterLock,
        deleteCharacter,
        updatePrompt,
        sendPromptToGeneration,
        retryJob,
        completeJob,
        addPlatformUpload,
        deletePlatformUpload,
        addAsset,
        deleteAsset,
        resetToDemoData,
        exportDataAsJSON
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const ctx = useContext(VideoContext);
  if (!ctx) {
    throw new Error('useVideo must be used within VideoProvider');
  }
  return ctx;
}
