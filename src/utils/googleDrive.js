/**
 * Google Drive Utilities for Lingotoon Animation Studio
 * Handles direct embedding of Google Drive image files, folder normalization,
 * and database JSON import/export.
 */

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
