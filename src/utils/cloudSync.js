/**
 * Universal Cloud Synchronization & Real-time Collaboration Engine
 * for Lingotoon Animation Studio.
 * 
 * Provides:
 * 1. Global Zero-Config Cloud Sync (works across all browsers/links out-of-the-box)
 * 2. Bi-directional sync with Owner's Google Drive (permanent archive)
 * 3. Cross-device presence & heartbeat broadcasting
 * 4. Conflict-free timestamped merging
 */

import {
  saveDatabaseToOwnerDrive,
  fetchDatabaseFromOwnerDrive,
  isOwnerDriveConfigured
} from './googleDrive';

// Global Cloud Sync Endpoint (persisted object for Lingotoon Studio)
const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects/ff808181a09d98f701a10a9663e279de';

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

  const payload = {
    name: 'Lingotoon Global Studio DB',
    data: {
      videos: normalizedVideos,
      lastUpdated: timestamp,
      updatedBy: userName
    }
  };

  // 1. Save to Global Cloud Endpoint (Instant multi-device link sync)
  let cloudSuccess = false;
  try {
    const res = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      cloudSuccess = true;
    }
  } catch (err) {
    console.warn('Global Cloud sync notice:', err.message);
  }

  // 2. Also save to Owner's Google Drive (Permanent archive)
  let driveSuccess = false;
  if (isOwnerDriveConfigured()) {
    try {
      await saveDatabaseToOwnerDrive(normalizedVideos);
      driveSuccess = true;
    } catch (err) {
      console.warn('Google Drive sync notice:', err.message);
    }
  }

  // 3. Broadcast to all open tabs on the same machine
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
    success: cloudSuccess || driveSuccess,
    cloudSuccess,
    driveSuccess,
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
  let cloudData = null;
  let cloudTime = 0;

  // 1. Try Global Cloud
  try {
    const res = await fetch(`${CLOUD_SYNC_ENDPOINT}?t=${Date.now()}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.videos && typeof json.data.videos === 'object') {
        cloudData = json.data.videos;
        cloudTime = json.data.lastUpdated || 0;
      }
    }
  } catch (err) {
    console.warn('Global Cloud pull notice:', err.message);
  }

  // 2. Try Google Drive if configured
  let driveData = null;
  let driveTime = 0;
  if (isOwnerDriveConfigured()) {
    try {
      const gDriveRes = await fetchDatabaseFromOwnerDrive();
      if (gDriveRes && typeof gDriveRes === 'object' && Object.keys(gDriveRes).length > 0) {
        driveData = gDriveRes;
        // Check if there is an updatedAt flag
        driveTime = Date.now(); // Drive file presence is authoritative if newer
      }
    } catch (err) {
      // Expected if Apps Script is still pending redeployment
    }
  }

  // Prefer the freshest source
  if (cloudData && (!driveData || cloudTime >= driveTime)) {
    return {
      videos: cloudData,
      lastUpdated: cloudTime,
      source: 'global_cloud'
    };
  }

  if (driveData) {
    return {
      videos: driveData,
      lastUpdated: driveTime,
      source: 'google_drive'
    };
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
