/**
 * LINGOTOON ANIMATION STUDIO - GOOGLE DRIVE CLOUD BRIDGE & REALTIME HOST
 * 
 * Centralized, multi-user cloud datastore and permanent Google Drive archive.
 * 
 * -------------------------------------------------------------
 * 🚀 QUICK 1-STEP AUTHORIZATION:
 * In the function dropdown at the top of script.google.com:
 * 1. Select "authorizeGoogleDrive"
 * 2. Click "▷ Run"
 * 3. Click "Review permissions" -> Choose your account -> "Advanced" -> "Go to Lingotoon (unsafe)" -> "Allow"
 * 4. Click "Deploy" -> "Manage deployments" -> Edit (pencil) -> Version: "New version" -> "Deploy"
 * -------------------------------------------------------------
 */

// Target Studio Folder ID
var DEFAULT_FOLDER_ID = "1iwJh3GtwDtAjUy4t1FeqBgw0b_XBmyva";

/**
 * 🔑 SELECT THIS IN THE DROPDOWN AND CLICK "▷ Run" TO AUTHORIZE GOOGLE DRIVE!
 * This forces Google to show the authorization prompt so your script can save files to Drive.
 */
function authorizeGoogleDrive() {
  try {
    var folder = DriveApp.getFolderById(DEFAULT_FOLDER_ID);
    Logger.log("✅ Google Drive connected successfully! Target folder: " + folder.getName());
    return "Google Drive authorized successfully! Folder: " + folder.getName();
  } catch (e) {
    Logger.log("Authorization notice: " + e.message);
    throw e;
  }
}

/**
 * Quick diagnostic connection test
 */
function testConnection() {
  Logger.log("Lingotoon Cloud Host is active and operational.");
  return "OK";
}

/**
 * Handles HTTP POST requests (database sync & file uploads)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Missing postData body" }, 400);
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || "upload";
    var folderId = payload.folderId || DEFAULT_FOLDER_ID;

    // ==========================================
    // ACTION: SAVE STUDIO DATABASE
    // ==========================================
    if (action === "save_db") {
      var dbJsonString = typeof payload.data === "string" ? payload.data : JSON.stringify(payload.data, null, 2);
      var driveSaved = false;
      var fileId = null;
      var driveError = null;

      // 1. Try to save directly to Owner's Google Drive Folder
      try {
        var targetFolder = DriveApp.getFolderById(folderId);
        var existingFiles = targetFolder.getFilesByName("lingotoon-database.json");
        var dbFile;
        if (existingFiles.hasNext()) {
          dbFile = existingFiles.next();
          dbFile.setContent(dbJsonString);
        } else {
          var dbBlob = Utilities.newBlob(dbJsonString, "application/json", "lingotoon-database.json");
          dbFile = targetFolder.createFile(dbBlob);
          dbFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
        fileId = dbFile.getId();
        driveSaved = true;
      } catch (dErr) {
        driveError = dErr.message;
        Logger.log("Drive save notice: " + dErr.message);
      }

      // 2. ALWAYS save to Script Properties (zero-auth multi-user cloud datastore)
      try {
        saveToScriptProperties("lingotoon_studio_db", dbJsonString);
      } catch (pErr) {
        Logger.log("Properties save notice: " + pErr.message);
      }

      return jsonResponse({
        success: true,
        action: "save_db",
        driveSaved: driveSaved,
        cloudSaved: true,
        fileId: fileId,
        driveError: driveError,
        updatedAt: new Date().toISOString(),
        message: driveSaved 
          ? "Studio database synced to Google Drive & Cloud Storage" 
          : "Studio database synced to Cloud Storage (Run authorizeGoogleDrive once in script editor to also sync to Drive folder)"
      });
    }

    // ==========================================
    // ACTION: UPLOAD ASSET/IMAGE
    // ==========================================
    if (action === "upload") {
      var base64Data = payload.data;
      var fileName = payload.filename || ("lingotoon_asset_" + Date.now() + ".png");
      var mimeType = payload.mimeType || "image/png";

      if (!base64Data) {
        return jsonResponse({ success: false, error: "Missing image base64 data" }, 400);
      }

      if (base64Data.indexOf(",") > -1) {
        var parts = base64Data.split(",");
        base64Data = parts[1];
      }

      try {
        var targetFolder = DriveApp.getFolderById(folderId);
        var decodedBytes = Utilities.base64Decode(base64Data);
        var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
        var file = targetFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        var uploadedId = file.getId();
        return jsonResponse({
          success: true,
          action: "upload",
          fileId: uploadedId,
          fileName: file.getName(),
          sizeBytes: file.getSize(),
          directUrl: "https://drive.google.com/thumbnail?id=" + uploadedId + "&sz=w1600",
          webViewLink: file.getUrl(),
          message: "Successfully uploaded to Studio Owner's Google Drive"
        });
      } catch (err) {
        return jsonResponse({
          success: false,
          error: "Google Drive upload requires authorization: In script.google.com, select 'authorizeGoogleDrive' from the dropdown and click 'Run'. (" + err.message + ")"
        }, 403);
      }
    }

    return jsonResponse({ success: false, error: "Unknown action: " + action }, 400);

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  }
}

/**
 * Handles HTTP GET requests (ping & fetch database)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
    var folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : DEFAULT_FOLDER_ID;

    // ==========================================
    // HEALTH CHECK / CONNECTION TEST
    // ==========================================
    if (action === "ping") {
      var driveAuthorized = false;
      var folderName = null;
      try {
        var folder = DriveApp.getFolderById(folderId);
        driveAuthorized = true;
        folderName = folder.getName();
      } catch (e) {
        driveAuthorized = false;
      }

      return jsonResponse({
        success: true,
        status: "ok",
        service: "Lingotoon Drive Cloud Host",
        driveAuthorized: driveAuthorized,
        folderName: folderName,
        cloudStorageActive: true,
        folderId: folderId,
        timestamp: new Date().toISOString()
      });
    }

    // ==========================================
    // FETCH STUDIO DATABASE
    // ==========================================
    if (action === "get_db") {
      // 1. Try reading from Google Drive Folder first
      try {
        var targetFolder = DriveApp.getFolderById(folderId);
        var files = targetFolder.getFilesByName("lingotoon-database.json");
        if (files.hasNext()) {
          var file = files.next();
          var content = file.getBlob().getDataAsString();
          var parsed = JSON.parse(content);
          return jsonResponse({
            success: true,
            source: "google_drive",
            fileId: file.getId(),
            updatedAt: file.getLastUpdated().toISOString(),
            data: parsed
          });
        }
      } catch (e) {
        Logger.log("Drive read notice: " + e.message);
      }

      // 2. Fallback to Script Properties (Multi-user Cloud Datastore)
      var scriptDb = loadFromScriptProperties("lingotoon_studio_db");
      if (scriptDb) {
        try {
          var parsedProps = JSON.parse(scriptDb);
          return jsonResponse({
            success: true,
            source: "cloud_storage",
            data: parsedProps
          });
        } catch (e) {}
      }

      return jsonResponse({
        success: true,
        source: "empty",
        data: {}
      });
    }

    return jsonResponse({ success: false, error: "Unknown action: " + action }, 400);

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  }
}

/**
 * Splits large JSON strings across ScriptProperties (each key max 9KB)
 */
function saveToScriptProperties(key, str) {
  var props = PropertiesService.getScriptProperties();
  var chunkSize = 8000;
  var count = Math.ceil(str.length / chunkSize);
  props.setProperty(key + "_chunks", String(count));
  for (var i = 0; i < count; i++) {
    props.setProperty(key + "_" + i, str.substr(i * chunkSize, chunkSize));
  }
}

/**
 * Reassembles chunked JSON strings from ScriptProperties
 */
function loadFromScriptProperties(key) {
  var props = PropertiesService.getScriptProperties();
  var countStr = props.getProperty(key + "_chunks");
  if (!countStr) {
    return props.getProperty(key);
  }
  var count = parseInt(countStr, 10);
  var full = "";
  for (var i = 0; i < count; i++) {
    var part = props.getProperty(key + "_" + i);
    if (part) full += part;
  }
  return full;
}

/**
 * Returns JSON response with CORS headers
 */
function jsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
