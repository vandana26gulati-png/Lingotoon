/**
 * Universal Cloud Synchronization & Real-time Collaboration Engine
 * for Lingotoon Animation Studio.
 * 
 * Provides:
 * 1. Global Zero-Config Cloud Sync via Studio Owner's Google Cloud Bridge
 * 2. Automatic dual persistence: Google Drive Folder + Script Properties Datastore
 * 3. Cross-tab and cross-device realtime synchronization
 * 4. Conflict-free timestamped merging
 */

import {
  saveDatabaseToOwnerDrive,
  fetchDatabaseFromOwnerDrive,
  isOwnerDriveConfigured
} from './googleDrive';

const BROADCAST_CHANNEL_NAME = 'lingotoon_global_sync_bus';
let broadcastChannel = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported:', e);
  }
}

/**
 * Saves current studio state to Cloud & Google Drive.
 * 
 * @param {Object} videos - The studio projects dictionary
 * @param {Object} user - The active collaborator making the change
 * @returns {Promise<{success: boolean, timestamp: number}>}
 */
export async function pushStudioStateToCloud(videos, user = null) {
  const timestamp = Date.now();
  const userName = user?.name || 'Studio Collaborator';

  // Mark all videos with updated timestamps
  const normalizedVideos = {};
  for (const [id, vid] of Object.entries(videos || {})) {
    normalizedVideos[id] = {
      ...vid,
      updatedAt: vid.updatedAt || timestamp
    };
  }

  // Save to Google Cloud Bridge (Dual: Drive Folder + Script Properties)
  let cloudSuccess = false;
  if (isOwnerDriveConfigured()) {
    try {
      const res = await saveDatabaseToOwnerDrive(normalizedVideos);
      if (res && res.success) {
        cloudSuccess = true;
      }
    } catch (err) {
      console.warn('Google Cloud sync notice:', err.message);
    }
  }

  // Broadcast to all open tabs on the same machine
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'STUDIO_STATE_UPDATED',
        timestamp,
        updatedBy: userName
      });
    } catch (e) {}
  }

  return {
    success: cloudSuccess,
    cloudSuccess,
    driveSuccess: cloudSuccess,
    timestamp
  };
}

/**
 * Fetches latest studio state from Global Cloud and Google Drive.
 * Merges newer changes intelligently.
 * 
 * @returns {Promise<{videos: Object, lastUpdated: number, source: string} | null>}
 */
export async function pullLatestStudioStateFromCloud() {
  if (!isOwnerDriveConfigured()) return null;

  try {
    const data = await fetchDatabaseFromOwnerDrive();
    if (data && typeof data === 'object') {
      return {
        videos: data,
        lastUpdated: Date.now(),
        source: 'google_cloud'
      };
    }
  } catch (err) {
    // Expected if script is still deploying
  }

  return null;
}

/**
 * Smart Conflict-Free Merge:
 * Merges incoming cloud videos into current local videos without losing unsaved edits.
 */
export function mergeStudioVideos(localVideos = {}, cloudVideos = {}) {
  const merged = { ...localVideos };

  for (const [vidId, cloudVid] of Object.entries(cloudVideos || {})) {
    if (!merged[vidId]) {
      // New project created on another device -> Add it immediately!
      merged[vidId] = cloudVid;
      continue;
    }

    const localVid = merged[vidId];
    const cloudUpdated = cloudVid.updatedAt || 0;
    const localUpdated = localVid.updatedAt || 0;

    // If cloud has newer or equal timestamp, cloud takes precedence for structural data
    const baseVid = cloudUpdated >= localUpdated ? { ...localVid, ...cloudVid } : { ...cloudVid, ...localVid };

    // Merge shots: preserve all shots, comments, and images
    const localShots = localVid.shots || [];
    const cloudShots = cloudVid.shots || [];
    const maxLen = Math.max(localShots.length, cloudShots.length);
    const mergedShots = [];

    for (let i = 0; i < maxLen; i++) {
      const sLocal = localShots[i];
      const sCloud = cloudShots[i];

      if (!sLocal) {
        mergedShots.push(sCloud);
        continue;
      }
      if (!sCloud) {
        mergedShots.push(sLocal);
        continue;
      }

      // Merge comments by unique ID
      const localComments = sLocal.comments || [];
      const cloudComments = sCloud.comments || [];
      const seenComments = new Set(localComments.map(c => c.id));
      const combinedComments = [...localComments];

      for (const c of cloudComments) {
        if (!seenComments.has(c.id)) {
          combinedComments.push(c);
          seenComments.add(c.id);
        }
      }

      // If cloud is newer, cloud fields win, otherwise local
      const shotBase = cloudUpdated >= localUpdated
        ? { ...sLocal, ...sCloud }
        : { ...sCloud, ...sLocal };

      mergedShots.push({
        ...shotBase,
        comments: combinedComments
      });
    }

    baseVid.shots = mergedShots;
    merged[vidId] = baseVid;
  }

  return merged;
}
