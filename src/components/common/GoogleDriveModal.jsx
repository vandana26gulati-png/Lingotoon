import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useVideo } from '../../context/VideoContext';
import {
  formatDriveFolderUrl,
  getDriveDirectDownloadUrl,
  getOwnerDriveConfig,
  setOwnerDriveConfig,
  testOwnerDriveConnection,
  saveDatabaseToOwnerDrive,
  fetchDatabaseFromOwnerDrive,
  extractDriveFolderId,
  extractDriveApiUrl,
  uploadFileToOwnerDrive
} from '../../utils/googleDrive';
import {
  ExternalLink,
  HardDrive,
  Download,
  UploadCloud,
  Check,
  Copy,
  HelpCircle,
  Save,
  Server,
  CloudLightning,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Code2
} from 'lucide-react';

const APPS_SCRIPT_TEMPLATE = `/**
 * LINGOTOON ANIMATION STUDIO - GOOGLE DRIVE CLOUD BRIDGE & REALTIME HOST
 * Deployed under your personal Google account with TBs of storage!
 */
var DEFAULT_FOLDER_ID = "1iwJh3GtwDtAjUy4t1FeqBgw0b_XBmyva";

/**
 * 🔑 SELECT THIS IN THE DROPDOWN AND CLICK "▷ Run" TO AUTHORIZE GOOGLE DRIVE!
 * This forces Google to show the authorization prompt so your script can save files to Drive.
 */
function authorizeGoogleDrive() {
  var folder = DriveApp.getFolderById(DEFAULT_FOLDER_ID);
  Logger.log("✅ Google Drive connected successfully! Target folder: " + folder.getName());
  return "Google Drive authorized successfully! Folder: " + folder.getName();
}

function testConnection() {
  Logger.log("Lingotoon Cloud Host is active.");
  return "OK";
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Missing postData body" }, 400);
    }
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || "upload";
    var folderId = payload.folderId || DEFAULT_FOLDER_ID;

    // SAVE STUDIO DATABASE
    if (action === "save_db") {
      var dbJsonString = typeof payload.data === "string" ? payload.data : JSON.stringify(payload.data, null, 2);
      var driveSaved = false;
      var fileId = null;

      try {
        var targetFolder = DriveApp.getFolderById(folderId);
        var existingFiles = targetFolder.getFilesByName("lingotoon-database.json");
        var dbFile = existingFiles.hasNext() ? existingFiles.next() : targetFolder.createFile(Utilities.newBlob(dbJsonString, "application/json", "lingotoon-database.json"));
        if (existingFiles.hasNext()) dbFile.setContent(dbJsonString);
        dbFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileId = dbFile.getId();
        driveSaved = true;
      } catch (dErr) {
        Logger.log("Drive save notice: " + dErr.message);
      }

      // Always save to Script Properties backup (zero-auth multi-user cloud datastore)
      try {
        saveToScriptProperties("lingotoon_studio_db", dbJsonString);
      } catch (pErr) {}

      return jsonResponse({
        success: true,
        action: "save_db",
        driveSaved: driveSaved,
        cloudSaved: true,
        fileId: fileId,
        updatedAt: new Date().toISOString(),
        message: driveSaved ? "Studio database synced to Google Drive & Cloud" : "Studio database synced to Cloud Storage"
      });
    }

    // UPLOAD IMAGE / ASSET
    if (action === "upload") {
      var base64Data = payload.data;
      var fileName = payload.filename || ("lingotoon_" + Date.now() + ".png");
      var mimeType = payload.mimeType || "image/png";

      if (!base64Data) return jsonResponse({ success: false, error: "Missing image base64 data" }, 400);
      if (base64Data.indexOf(",") > -1) base64Data = base64Data.split(",")[1];

      try {
        var targetFolder = DriveApp.getFolderById(folderId);
        var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
        var file = targetFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        var uploadedId = file.getId();
        return jsonResponse({
          success: true,
          action: "upload",
          fileId: uploadedId,
          fileName: file.getName(),
          directUrl: "https://drive.google.com/thumbnail?id=" + uploadedId + "&sz=w1600",
          webViewLink: file.getUrl()
        });
      } catch (err) {
        return jsonResponse({
          success: false,
          error: "Drive permission needed: In script.google.com, select 'authorizeGoogleDrive' from dropdown and click 'Run'. (" + err.message + ")"
        }, 403);
      }
    }

    return jsonResponse({ success: false, error: "Unknown action: " + action }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  }
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
    var folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : DEFAULT_FOLDER_ID;

    if (action === "ping") {
      var driveAuthorized = false;
      try {
        DriveApp.getFolderById(folderId);
        driveAuthorized = true;
      } catch (e) {}
      return jsonResponse({
        success: true,
        status: "ok",
        service: "Lingotoon Drive Cloud Host",
        driveAuthorized: driveAuthorized,
        cloudStorageActive: true
      });
    }

    if (action === "get_db") {
      try {
        var targetFolder = DriveApp.getFolderById(folderId);
        var files = targetFolder.getFilesByName("lingotoon-database.json");
        if (files.hasNext()) {
          var file = files.next();
          return jsonResponse({
            success: true,
            source: "google_drive",
            fileId: file.getId(),
            updatedAt: file.getLastUpdated().toISOString(),
            data: JSON.parse(file.getBlob().getDataAsString())
          });
        }
      } catch (e) {}

      var scriptDb = loadFromScriptProperties("lingotoon_studio_db");
      if (scriptDb) {
        try {
          return jsonResponse({ success: true, source: "cloud_storage", data: JSON.parse(scriptDb) });
        } catch (e) {}
      }

      return jsonResponse({ success: true, source: "empty", data: {} });
    }

    return jsonResponse({ success: false, error: "Unknown action" }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  }
}

function saveToScriptProperties(key, str) {
  var props = PropertiesService.getScriptProperties();
  var chunkSize = 8000;
  var count = Math.ceil(str.length / chunkSize);
  props.setProperty(key + "_chunks", String(count));
  for (var i = 0; i < count; i++) {
    props.setProperty(key + "_" + i, str.substr(i * chunkSize, chunkSize));
  }
}

function loadFromScriptProperties(key) {
  var props = PropertiesService.getScriptProperties();
  var countStr = props.getProperty(key + "_chunks");
  if (!countStr) return props.getProperty(key);
  var count = parseInt(countStr, 10);
  var full = "";
  for (var i = 0; i < count; i++) {
    var part = props.getProperty(key + "_" + i);
    if (part) full += part;
  }
  return full;
}

function jsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

export default function GoogleDriveModal({ isOpen, onClose }) {
  const { videos, exportDataAsJSON, importDataFromJSON, addToast } = useVideo();

  const [activeTab, setActiveTab] = useState('cloud_host'); // 'cloud_host' | 'browser'
  
  // Owner Drive Cloud Host Config
  const [apiUrl, setApiUrl] = useState('');
  const [folderInput, setFolderInput] = useState('');
  const [autoUpload, setAutoUpload] = useState(true);

  // Test Connection states
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // { success: boolean, msg: string }

  // Cloud DB sync states
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Copy states
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedFolder, setCopiedFolder] = useState(false);

  // Direct file uploader states
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFilesList, setUploadedFilesList] = useState([]);

  // Legacy/Manual import
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleUploadFileToDrive = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const res = await uploadFileToOwnerDrive(file, file.name, file.type);
      setUploadedFilesList(prev => [res, ...prev]);
      addToast(`"${file.name}" uploaded to Google Drive!`, 'success');
    } catch (err) {
      console.error(err);
      addToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      const config = getOwnerDriveConfig();
      setApiUrl(config.apiUrl);
      setFolderInput(config.folderId);
      setAutoUpload(config.autoUpload);
      setConnectionStatus(null);
    }
  }, [isOpen]);

  const handleSaveConfig = (e) => {
    e?.preventDefault();
    const cleanApiUrl = extractDriveApiUrl(apiUrl) || apiUrl.trim();
    setApiUrl(cleanApiUrl);
    const cleanFolderId = extractDriveFolderId(folderInput) || folderInput.trim();
    setOwnerDriveConfig({
      apiUrl: cleanApiUrl,
      folderId: cleanFolderId,
      autoUpload
    });
    addToast('Studio Google Drive Cloud settings saved!', 'success');
  };

  const handleTestConnection = async () => {
    const cleanUrl = extractDriveApiUrl(apiUrl) || apiUrl.trim();
    if (cleanUrl !== apiUrl) {
      setApiUrl(cleanUrl);
    }
    if (!cleanUrl) {
      addToast('Please enter your Google Apps Script Web App URL first', 'error');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await testOwnerDriveConnection(cleanUrl);
      if (res.success) {
        setConnectionStatus({ success: true, msg: res.message || 'Connected successfully! TBs Storage Host Active.' });
        addToast(res.message || 'Connected to your Google Drive Cloud Host!', 'success');
      } else {
        setConnectionStatus({ success: false, msg: res.error || 'Connection failed' });
      }
    } catch (err) {
      setConnectionStatus({ success: false, msg: err.message || 'Connection failed' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
    addToast('Apps Script code copied to clipboard!', 'info');
  };

  const handleSyncDbToDrive = async () => {
    setIsSyncingDb(true);
    try {
      const currentData = localStorage.getItem('lingotoon_studio_clean_v3');
      const parsed = currentData ? JSON.parse(currentData) : { videos };
      await saveDatabaseToOwnerDrive(parsed);
      addToast('Studio Database successfully synced to your Google Drive!', 'success');
    } catch (err) {
      console.error(err);
      addToast(`Database sync failed: ${err.message}`, 'error');
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleLoadDbFromDrive = async () => {
    if (!confirm('Sync database from your Google Drive? This will refresh your current local studio view with the latest cloud state.')) return;
    setIsSyncingDb(true);
    try {
      const cloudDb = await fetchDatabaseFromOwnerDrive();
      if (cloudDb && typeof cloudDb === 'object') {
        localStorage.setItem('lingotoon_studio_clean_v3', JSON.stringify(cloudDb));
        addToast('Database successfully loaded from Google Drive! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error('Invalid database format returned from Google Drive');
      }
    } catch (err) {
      console.error(err);
      addToast(`Could not load from Google Drive: ${err.message}`, 'error');
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleOpenFolder = () => {
    const cleanFolderId = extractDriveFolderId(folderInput) || folderInput.trim();
    const url = formatDriveFolderUrl(cleanFolderId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleImportFromUrl = async (e) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setIsImporting(true);
    try {
      const downloadUrl = getDriveDirectDownloadUrl(importUrl.trim());
      if (!downloadUrl) throw new Error('Invalid Google Drive file link.');

      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`Failed to fetch file (HTTP ${res.status}). Ensure sharing is set to "Anyone with link can view".`);

      const parsedData = await res.json();
      if (parsedData && typeof parsedData === 'object') {
        localStorage.setItem('lingotoon_studio_clean_v3', JSON.stringify(parsedData));
        addToast('Database imported from link! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Import failed.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const isConfigured = Boolean(apiUrl && folderInput);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Google Drive Cloud Host & Asset Hub">
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'cloud_host' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '12px', padding: '5px 14px' }}
            onClick={() => setActiveTab('cloud_host')}
          >
            <CloudLightning className="w-3.5 h-3.5 mr-1" />
            Studio Owner Cloud Host (TBs Storage)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'browser' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '12px', padding: '5px 14px' }}
            onClick={() => setActiveTab('browser')}
          >
            <HardDrive className="w-3.5 h-3.5 mr-1" />
            Folder & Manual Links
          </button>
        </div>

        {/* TAB 1: OWNER CLOUD HOST (CENTRALIZED STORAGE) */}
        {activeTab === 'cloud_host' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Status Header Banner */}
            <div
              style={{
                background: isConfigured ? '#f5f3ff' : '#faf8fe',
                border: isConfigured ? '1px solid #ddd6fe' : '1px solid var(--line)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isConfigured ? 'var(--grape)' : '#ede7f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isConfigured ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Centralized Google Drive Cloud Host</span>
                    {isConfigured ? (
                      <span style={{ fontSize: '10px', color: '#059669', background: '#ecfdf5', padding: '1px 7px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                        ● Active (TBs Storage)
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#6b7280', background: '#f3f4f6', padding: '1px 7px', borderRadius: '10px' }}>
                        ○ Not Configured
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    All user uploads anywhere in this studio will save directly into your personal Google Drive folder!
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={handleTestConnection}
                  disabled={testingConnection || !apiUrl}
                >
                  {testingConnection ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                  Test Connection
                </button>
              </div>
            </div>

            {/* Connection Status Toast / Alert */}
            {connectionStatus && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: connectionStatus.success ? '#ecfdf5' : '#fff7ed',
                  border: connectionStatus.success ? '1px solid #a7f3d0' : '1px solid #fdba74',
                  color: connectionStatus.success ? '#065f46' : '#9a3412',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  {connectionStatus.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 text-orange-600" />}
                  <span>{connectionStatus.msg}</span>
                </div>

                {!connectionStatus.success && (
                  <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fed7aa', color: '#431407', fontSize: '11.5px', lineHeight: 1.55 }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', color: '#c2410c' }}>
                      👉 How to fix & authorize Google Drive (30 seconds):
                    </div>
                    <ol style={{ margin: '0 0 8px 0', paddingLeft: '18px' }}>
                      <li>Open <a href="https://script.google.com" target="_blank" rel="noreferrer" style={{ color: '#ea580c', fontWeight: 700, textDecoration: 'underline' }}>script.google.com ↗</a> and open your project.</li>
                      <li>Select all code in <code>Code.gs</code>, paste the updated code below, and press <b>Ctrl + S</b>.</li>
                      <li>In the function dropdown at the top, select <b><code>authorizeGoogleDrive</code></b> and click <b>▷ Run</b>.</li>
                      <li>A popup will appear: Click <b>Review Permissions</b> ➔ Choose Account ➔ <b>Advanced</b> ➔ <b>Go to Lingotoon (unsafe)</b> ➔ <b>Allow</b>.</li>
                      <li>Click <b>Deploy (top right)</b> ➔ <b>Manage deployments</b> ➔ Pencil icon ➔ Version: <b>"New version"</b> ➔ <b>Deploy</b>.</li>
                      <li>Come back here and click <b>Test Connection</b>!</li>
                    </ol>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '10.5px', padding: '3px 10px', background: '#ea580c', borderColor: '#ea580c' }}
                        onClick={handleCopyScript}
                      >
                        {copiedScript ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedScript ? 'Code Copied!' : 'Copy Apps Script Code'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '10.5px', padding: '3px 10px' }}
                        onClick={exportDataAsJSON}
                        title="Download backup file to drag & drop into Google Drive folder manually"
                      >
                        <Download className="w-3 h-3 mr-1" /> Download Database JSON File
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '10.5px', padding: '3px 10px' }}
                        onClick={handleOpenFolder}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" /> Open Drive Folder ↗
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Configuration Form */}
            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="field">
                <label>1. Google Apps Script Web App URL (Bridge Endpoint)</label>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={apiUrl}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const clean = extractDriveApiUrl(raw);
                    setApiUrl(clean && clean.startsWith('https://') ? clean : raw);
                  }}
                  onBlur={() => {
                    const clean = extractDriveApiUrl(apiUrl);
                    if (clean) setApiUrl(clean);
                  }}
                  style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Deploy the Apps Script below in your Google account with access set to "Anyone".
                </span>
              </div>

              <div className="field">
                <label>2. Google Drive Destination Folder ID or URL</label>
                <input
                  type="text"
                  placeholder="1A2b3C4d5E... or https://drive.google.com/drive/folders/..."
                  value={folderInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const clean = extractDriveFolderId(raw);
                    setFolderInput(clean || raw);
                  }}
                  onBlur={() => {
                    const clean = extractDriveFolderId(folderInput);
                    if (clean) setFolderInput(clean);
                  }}
                  style={{ fontSize: '12.5px' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  The Google Drive folder in your account where all uploaded storyboard & character images will be saved.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={autoUpload}
                      onChange={(e) => setAutoUpload(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--grape)' }}
                    />
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-bright)' }}>
                      Auto-upload all images directly to Owner's Google Drive
                    </span>
                  </label>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 24px' }}>
                    When checked, any file dropped or picked in the studio uploads straight to your Drive and gets a high-res link.
                  </p>
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: '12px' }}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save Settings
                </button>
              </div>
            </form>

            {/* Direct File Uploader to Google Drive Folder */}
            <div style={{ background: '#f5f3ff', border: '1.5px dashed #a855f7', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--grape)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UploadCloud className="w-4 h-4 text-purple-600" />
                  <span>Upload Any File to Linked Google Drive Folder</span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={handleOpenFolder}
                  title="Open folder directly in Google Drive"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open in Google Drive ↗
                </button>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                All files uploaded here are saved directly into your Google Drive folder (<code>{folderInput || '1iwJh3GtwDtAjUy4t1FeqBgw0b_XBmyva'}</code>).
              </p>

              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  background: '#ffffff',
                  border: '1px dashed #c4b5fd',
                  borderRadius: 'var(--radius-sm)',
                  cursor: isUploadingFile ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(109, 40, 217, 0.05)'
                }}
              >
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleUploadFileToDrive}
                  disabled={isUploadingFile}
                />
                {isUploadingFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--grape)', fontWeight: 700, fontSize: '12px' }}>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>Uploading file directly to Google Drive...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-7 h-7 text-purple-600 mb-1.5" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-bright)' }}>
                      Click or drag & drop ANY file here to upload to Google Drive
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Images (.png, .jpg), Audio (.mp3, .wav), Scripts (.txt, .pdf), or Backups (.json, .csv)
                    </span>
                  </>
                )}
              </label>

              {/* Uploaded Files History */}
              {uploadedFilesList.length > 0 && (
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-bright)' }}>
                    Uploaded Files in this Session:
                  </span>
                  {uploadedFilesList.map((f, i) => (
                    <div
                      key={f.fileId || i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        background: '#ffffff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '6px',
                        fontSize: '11.5px'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '230px' }}>
                        📄 {f.fileName}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={f.webViewLink || f.directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '10.5px', padding: '2px 8px' }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> View in Drive
                        </a>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '10.5px', padding: '2px 8px' }}
                          onClick={() => {
                            navigator.clipboard.writeText(f.directUrl || f.webViewLink);
                            addToast('Link copied to clipboard!', 'info');
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" /> Copy Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cloud Database Actions */}
            {isConfigured && (
              <div style={{ background: '#fdfcfe', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-bright)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
                  <span>Central Cloud Database Sync (Google Drive)</span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Backup the entire studio state or sync the latest cloud database directly with your Drive folder:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11.5px' }}
                    onClick={handleSyncDbToDrive}
                    disabled={isSyncingDb}
                  >
                    {isSyncingDb ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <UploadCloud className="w-3 h-3 mr-1" />}
                    Backup Studio Database to Drive
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11.5px' }}
                    onClick={handleLoadDbFromDrive}
                    disabled={isSyncingDb}
                  >
                    {isSyncingDb ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                    Load Latest Cloud Database
                  </button>
                </div>
              </div>
            )}

            {/* 60-Second Setup Instructions with Copy Code */}
            <div style={{ background: '#faf8fe', border: '1px dashed var(--line-light)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--grape)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code2 className="w-4 h-4" />
                  <span>60-Second Setup Guide: Deploying to your Google Drive</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11px', padding: '3px 10px' }}
                  onClick={handleCopyScript}
                >
                  {copiedScript ? <Check className="w-3 h-3 mr-1 text-green-300" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedScript ? 'Code Copied!' : 'Copy Apps Script Code'}
                </button>
              </div>

              <ol style={{ fontSize: '11.5px', color: 'var(--text-muted)', paddingLeft: '18px', lineHeight: 1.6, margin: 0 }}>
                <li>Open <a href="https://drive.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--grape)', fontWeight: 600 }}>Google Drive</a> and create a folder named <b>"Lingotoon Studio Uploads"</b> (copy the folder ID from the URL).</li>
                <li>Go to <a href="https://script.google.com/home/start" target="_blank" rel="noreferrer" style={{ color: 'var(--grape)', fontWeight: 600 }}>script.google.com</a>, click <b>"New Project"</b>, click <b>"Copy Apps Script Code"</b> above, and paste it into the editor. Save (Ctrl+S).</li>
                <li>Click <b>Deploy &gt; New deployment</b> &gt; select <b>Web app</b>:
                  <div style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--line)', marginTop: '4px', display: 'inline-block' }}>
                    Execute as: <b>Me</b> &nbsp;|&nbsp; Who has access: <b>Anyone</b>
                  </div>
                </li>
                <li>Copy the <b>Web app URL</b> and paste it into field <b>#1</b> above. That's it! Your TBs of Drive storage is now the active studio host!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: FOLDER & MANUAL LINKS */}
        {activeTab === 'browser' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Studio Assets Folder Link */}
            <div style={{ background: 'var(--panel-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-bright)' }}>
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  <span>Studio Assets Google Drive Folder</span>
                </div>
                {folderInput && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 10px' }}
                    onClick={handleOpenFolder}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in Drive ↗
                  </button>
                )}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                Direct web link to open and explore your Google Drive assets folder:
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value)}
                  style={{ flex: 1, fontSize: '12.5px' }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleSaveConfig}
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>

            {/* Offline / File Export */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-bright)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download className="w-4 h-4 text-purple-600" />
                <span>Download Database File (JSON)</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Download an offline backup copy of your entire studio database:
              </p>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={exportDataAsJSON}
                style={{ fontSize: '12px' }}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Download lingotoon-database.json
              </button>
            </div>

            {/* Upload & Restore JSON Database */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px', background: '#faf5ff' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--grape)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UploadCloud className="w-4 h-4 text-purple-600" />
                <span>Upload & Restore Database (JSON)</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Upload an existing JSON file to restore and sync all projects into Lingotoon:
              </p>
              <label className="btn btn-primary btn-sm" style={{ fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Select & Upload JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      importDataFromJSON(file);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>

            {/* Manual Sync from File Link */}
            <form onSubmit={handleImportFromUrl} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)', display: 'block', marginBottom: '4px' }}>
                Sync from a Shared Google Drive File Link:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  style={{ flex: 1, fontSize: '12px' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!importUrl.trim() || isImporting}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isImporting ? 'Syncing...' : 'Sync Data'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      <div className="modal-foot">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
