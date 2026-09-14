/**
 * Google Drive Utilities for Lingotoon Animation Studio
 * Handles direct embedding of Google Drive image files, folder normalization,
 * centralized owner cloud hosting (TBs storage), and automated database sync.
 */

// Storage keys
export const STORAGE_KEY_GDRIVE_API = 'lingotoon_owner_gdrive_api_url';
export const STORAGE_KEY_GDRIVE_FOLDER = 'lingotoon_studio_gdrive_folder';
export const STORAGE_KEY_GDRIVE_AUTO_UPLOAD = 'lingotoon_gdrive_auto_upload';

/**
 * Retrieves the configured Owner Google Drive Cloud credentials and settings.
 * Checks localStorage first, with fallback to Vite environment variables.
 */
export function getOwnerDriveConfig() {
  const envApiUrl = import.meta.env?.VITE_GDRIVE_API_URL || '';
  const envFolderId = import.meta.env?.VITE_GDRIVE_FOLDER_ID || '';

  const storedApiUrl = localStorage.getItem(STORAGE_KEY_GDRIVE_API) || '';
  const storedFolder = localStorage.getItem(STORAGE_KEY_GDRIVE_FOLDER) || '';
  const autoUploadRaw = localStorage.getItem(STORAGE_KEY_GDRIVE_AUTO_UPLOAD);

  const apiUrl = storedApiUrl.trim() || envApiUrl.trim();
  const folderInput = storedFolder.trim() || envFolderId.trim();
  const folderId = extractDriveFolderId(folderInput) || folderInput;
  const autoUpload = autoUploadRaw === null ? true : autoUploadRaw === 'true';

  return {
    apiUrl,
    folderId,
    folderUrl: formatDriveFolderUrl(folderInput),
    autoUpload: Boolean(apiUrl && folderId && autoUpload),
    isConfigured: Boolean(apiUrl && folderId)
  };
}

/**
 * Saves owner Google Drive Cloud configuration to localStorage.
 */
export function setOwnerDriveConfig({ apiUrl, folderId, autoUpload }) {
  if (apiUrl !== undefined) {
    localStorage.setItem(STORAGE_KEY_GDRIVE_API, apiUrl.trim());
  }
  if (folderId !== undefined) {
    localStorage.setItem(STORAGE_KEY_GDRIVE_FOLDER, folderId.trim());
  }
  if (autoUpload !== undefined) {
    localStorage.setItem(STORAGE_KEY_GDRIVE_AUTO_UPLOAD, String(Boolean(autoUpload)));
  }
}

/**
 * Quick check if owner's Drive Cloud Host is set up and active
 */
export function isOwnerDriveConfigured() {
  const config = getOwnerDriveConfig();
  return config.isConfigured;
}

/**
 * Tests connection to the Owner Google Drive Apps Script Bridge
 */
export async function testOwnerDriveConnection(customApiUrl = null) {
  const apiUrl = customApiUrl || getOwnerDriveConfig().apiUrl;
  if (!apiUrl) {
    return { success: false, error: 'No Google Drive Web App URL specified' };
  }

  try {
    const pingUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=ping&t=${Date.now()}`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.success === true,
      message: data.service || 'Connected to Owner Google Drive Storage',
      data
    };
  } catch (err) {
    return {
      success: false,
      error: `Connection test failed: ${err.message}. Make sure your Apps Script is deployed as Web App with access set to 'Anyone'.`
    };
  }
}

/**
 * Uploads an image file or base64 data to the studio owner's Google Drive folder.
 * Consumes the owner's TBs storage and returns a high-resolution direct embed link.
 * 
 * @param {File|Blob|string} imageFileOrBase64 - File object or data:image/... string
 * @param {string} [customFileName] - Optional file name
 * @returns {Promise<{success: boolean, directUrl: string, fileId: string, webViewLink: string}>}
 */
export async function uploadImageToOwnerDrive(imageFileOrBase64, customFileName = null) {
  const config = getOwnerDriveConfig();
  if (!config.isConfigured) {
    throw new Error('Owner Google Drive is not configured. Please set the Web App URL and Folder ID in Cloud Settings.');
  }

  let base64Data = '';
  let mimeType = 'image/png';
  let fileName = customFileName || `lingotoon_frame_${Date.now()}.png`;

  if (typeof imageFileOrBase64 === 'string') {
    // Already a data URL
    base64Data = imageFileOrBase64;
    const mimeMatch = imageFileOrBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (mimeMatch) mimeType = mimeMatch[1];
  } else if (imageFileOrBase64 instanceof Blob || imageFileOrBase64 instanceof File) {
    mimeType = imageFileOrBase64.type || 'image/png';
    fileName = customFileName || imageFileOrBase64.name || fileName;
    base64Data = await fileToBase64(imageFileOrBase64);
  } else {
    throw new Error('Invalid image data provided for upload');
  }

  const payload = {
    action: 'upload',
    folderId: config.folderId,
    filename: fileName,
    mimeType: mimeType,
    data: base64Data
  };

  // Use text/plain to avoid CORS preflight OPTIONS rejection in Google Apps Script
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Google Drive API returned HTTP ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to upload image to Google Drive');
  }

  return {
    success: true,
    fileId: result.fileId,
    directUrl: result.directUrl || `https://drive.google.com/thumbnail?id=${result.fileId}&sz=w1600`,
    webViewLink: result.webViewLink,
    fileName: result.fileName
  };
}

/**
 * Saves the current studio database to the owner's Google Drive folder
 */
export async function saveDatabaseToOwnerDrive(databaseObject) {
  const config = getOwnerDriveConfig();
  if (!config.isConfigured) {
    throw new Error('Owner Google Drive is not configured.');
  }

  const payload = {
    action: 'save_db',
    folderId: config.folderId,
    data: databaseObject
  };

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Google Drive API returned HTTP ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to sync database to Google Drive');
  }

  return result;
}

/**
 * Fetches the studio database from the owner's Google Drive folder
 */
export async function fetchDatabaseFromOwnerDrive() {
  const config = getOwnerDriveConfig();
  if (!config.isConfigured) {
    throw new Error('Owner Google Drive is not configured.');
  }

  const url = `${config.apiUrl}${config.apiUrl.includes('?') ? '&' : '?'}action=get_db&folderId=${config.folderId}&t=${Date.now()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch database from Google Drive`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'No database found on Google Drive');
  }

  return result.data;
}

/**
 * Helper: Converts File/Blob to Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts a Google Drive File ID from various share link formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 */
export function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extracts a Google Drive Folder ID from folder link:
 * - https://drive.google.com/drive/folders/FOLDER_ID
 * - https://drive.google.com/drive/u/0/folders/FOLDER_ID
 */
export function extractDriveFolderId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : null;
}

/**
 * Converts any Google Drive image link into a direct, high-resolution CDN embed URL.
 * Uses Google's thumbnail API with sz=w1600 for high quality rendering without CORS/auth block.
 */
export function parseGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return url;

  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }

  return url;
}

/**
 * Checks if a string is a Google Drive link or contains a Google Drive file ID
 */
export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('drive.google.com') ||
    url.includes('googleusercontent.com/d/') ||
    Boolean(extractDriveFileId(url))
  );
}

/**
 * Normalizes a Google Drive folder URL for opening
 */
export function formatDriveFolderUrl(folderInput) {
  if (!folderInput) return 'https://drive.google.com';
  if (folderInput.startsWith('http://') || folderInput.startsWith('https://')) {
    return folderInput;
  }
  return `https://drive.google.com/drive/folders/${folderInput.trim()}`;
}

/**
 * Generates direct download link for a JSON database file hosted on Google Drive
 */
export function getDriveDirectDownloadUrl(fileUrlOrId) {
  const fileId = extractDriveFileId(fileUrlOrId) || fileUrlOrId;
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
