/**
 * Google Drive Utilities for Lingotoon Animation Studio
 * Handles direct embedding of Google Drive image files, folder normalization,
 * centralized owner cloud hosting (TBs storage), and automated database sync.
 */

// Storage keys
export const STORAGE_KEY_GDRIVE_API = 'lingotoon_owner_gdrive_api_url';
export const STORAGE_KEY_GDRIVE_FOLDER = 'lingotoon_studio_gdrive_folder';
export const STORAGE_KEY_GDRIVE_AUTO_UPLOAD = 'lingotoon_gdrive_auto_upload';
// Default pre-configured Owner Google Drive Cloud Bridge
export const DEFAULT_GDRIVE_API_URL = 'https://script.google.com/macros/s/AKfycbzWfsMwxBSXORyEoMxpCUHrOtcHbuM8t-n-i09HRtThr7tX2TAPqX2XrJiV-NCXIAp0YA/exec';
export const DEFAULT_GDRIVE_FOLDER_ID = '1iwJh3GtwDtAjUy4t1FeqBgw0b_XBmyva';

/**
 * Retrieves the configured Owner Google Drive Cloud credentials and settings.
 * Checks localStorage first, then Vite environment variables, then pre-configured defaults.
 */
export function getOwnerDriveConfig() {
  const envApiUrl = import.meta.env?.VITE_GDRIVE_API_URL || '';
  const envFolderId = import.meta.env?.VITE_GDRIVE_FOLDER_ID || '';

  const storedApiUrl = localStorage.getItem(STORAGE_KEY_GDRIVE_API) || '';
  const storedFolder = localStorage.getItem(STORAGE_KEY_GDRIVE_FOLDER) || '';
  const autoUploadRaw = localStorage.getItem(STORAGE_KEY_GDRIVE_AUTO_UPLOAD);

  const apiUrl = (storedApiUrl.trim() || envApiUrl.trim() || DEFAULT_GDRIVE_API_URL).trim();
  const folderInput = (storedFolder.trim() || envFolderId.trim() || DEFAULT_GDRIVE_FOLDER_ID).trim();
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

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      if (rawText.includes('Script function not found')) {
        return {
          success: false,
          error: "Google Apps Script needs redeployment: 'doGet' not found. In script.google.com, click Deploy > Manage deployments > Edit > Version: New version > Deploy."
        };
      }
      if (rawText.includes('Authorization') || rawText.includes('accounts.google.com')) {
        return {
          success: false,
          error: "Google Apps Script access restricted: Ensure 'Who has access' is set to 'Anyone' in the Web App deployment."
        };
      }
      return {
        success: false,
        error: `Apps Script returned non-JSON response. Check deployment settings in script.google.com.`
      };
    }

    if (!response.ok || !data.success) {
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    let statusMsg = 'Connected to Studio Cloud Sync Engine!';
    if (data.driveAuthorized === true) {
      statusMsg = 'Connected! Google Drive folder & Cloud Sync are fully active.';
    } else if (data.driveAuthorized === false) {
      statusMsg = 'Cloud Sync active! Select "authorizeGoogleDrive" in script editor to link Drive folder.';
    } else if (data.service) {
      statusMsg = `Connected: ${data.service}`;
    }

    return {
      success: true,
      message: statusMsg,
      data
    };
  } catch (err) {
    return {
      success: false,
      error: `Connection test failed: ${err.message}`
    };
  }
}

/**
 * Uploads ANY file (image, script, audio, archive, etc.) to the studio Google Drive folder.
 * 
 * @param {File|Blob|string} fileOrBase64 - File object or data string
 * @param {string} [customFileName] - Optional file name
 * @param {string} [customMimeType] - Optional mime type
 * @returns {Promise<{success: boolean, directUrl: string, fileId: string, webViewLink: string, fileName: string}>}
 */
export async function uploadFileToOwnerDrive(fileOrBase64, customFileName = null, customMimeType = null) {
  const config = getOwnerDriveConfig();
  if (!config.isConfigured) {
    throw new Error('Google Drive Cloud Bridge is not configured.');
  }

  let base64Data = '';
  let mimeType = customMimeType || 'application/octet-stream';
  let fileName = customFileName || `lingotoon_file_${Date.now()}`;

  if (typeof fileOrBase64 === 'string') {
    base64Data = fileOrBase64;
    const mimeMatch = fileOrBase64.match(/data:([a-zA-Z0-9-+/.]+);base64,/);
    if (mimeMatch) mimeType = mimeMatch[1];
  } else if (fileOrBase64 instanceof Blob || fileOrBase64 instanceof File) {
    mimeType = fileOrBase64.type || mimeType;
    fileName = customFileName || fileOrBase64.name || fileName;
    base64Data = await fileToBase64(fileOrBase64);
  } else {
    throw new Error('Invalid file data provided for upload');
  }

  const payload = {
    action: 'upload',
    folderId: config.folderId,
    filename: fileName,
    mimeType: mimeType,
    data: base64Data
  };

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();
  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    if (rawText.includes('Script function not found')) {
      throw new Error("Google Apps Script is missing 'doPost'. In script.google.com, ensure lingotoon-gdrive-bridge.gs is saved and deploy a 'New version'.");
    }
    throw new Error(`Google Drive returned non-JSON response (HTTP ${response.status})`);
  }

  if (!response.ok || !result.success) {
    throw new Error(result?.error || 'Failed to upload file to Google Drive');
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
 * Uploads an image file or base64 data to the studio Google Drive folder.
 */
export async function uploadImageToOwnerDrive(imageFileOrBase64, customFileName = null) {
  let fileName = customFileName;
  if (!fileName && imageFileOrBase64 instanceof File) {
    fileName = imageFileOrBase64.name;
  }
  if (!fileName) {
    fileName = `lingotoon_frame_${Date.now()}.png`;
  }
  return uploadFileToOwnerDrive(imageFileOrBase64, fileName, 'image/png');
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

  const rawText = await response.text();
  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    if (rawText.includes('Script function not found')) {
      throw new Error("Google Apps Script needs redeployment: 'doPost' not found. In script.google.com, click Deploy > Manage deployments > Edit > Version: New version > Deploy.");
    }
    throw new Error(`Google Apps Script returned unexpected response (HTTP ${response.status})`);
  }

  if (!response.ok || !result.success) {
    throw new Error(result?.error || 'Failed to sync database to Google Drive');
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

  const rawText = await response.text();
  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    if (rawText.includes('Script function not found')) {
      throw new Error("Google Apps Script needs redeployment: 'doGet' not found.");
    }
    throw new Error(`Google Apps Script returned unexpected response (HTTP ${response.status})`);
  }

  if (!response.ok || !result.success) {
    throw new Error(result?.error || 'No database found on Google Drive');
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
