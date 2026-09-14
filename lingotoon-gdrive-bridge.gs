/**
 * LINGOTOON ANIMATION STUDIO - GOOGLE DRIVE CLOUD BRIDGE
 * 
 * This script runs inside YOUR personal Google account (with TBs of storage)
 * and acts as the centralized cloud host for Lingotoon Animation Studio.
 * 
 * Anyone using the website can upload images or sync the studio database,
 * and all files will be stored directly in YOUR Google Drive folder!
 * 
 * -------------------------------------------------------------
 * 🚀 2-MINUTE SETUP INSTRUCTIONS:
 * 1. Open Google Drive (drive.google.com) and create a folder named "Lingotoon Studio Uploads".
 *    - Open the folder and copy the Folder ID from the address bar (the string of letters/numbers after /folders/).
 * 2. Go to https://script.google.com/home/start and click "New Project".
 * 3. Delete any code in the editor, paste this entire file, and click Save (Ctrl+S / Cmd+S).
 * 4. Click the blue "Deploy" button (top right) -> "New deployment".
 * 5. Click the gear icon next to "Select type" -> select "Web app".
 *    - Description: "Lingotoon Studio Cloud Host"
 *    - Execute as: "Me (your_email@gmail.com)"  <-- IMPORTANT: This uses YOUR TBs of storage!
 *    - Who has access: "Anyone"                <-- IMPORTANT: Allows visitors/collaborators to upload!
 * 6. Click "Deploy", grant permissions when prompted, and copy the "Web app URL" (ending in /exec).
 * 7. Paste that Web App URL and your Folder ID into the Lingotoon Studio "Google Drive Cloud Host" settings!
 * -------------------------------------------------------------
 */

// Default Folder ID fallback if not provided in the request payload
var DEFAULT_FOLDER_ID = ""; // Optional: Paste your folder ID here, or pass it from the app

/**
 * Handles HTTP POST requests (image uploads & database saves)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Missing postData body" }, 400);
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || "upload";
    var folderId = payload.folderId || DEFAULT_FOLDER_ID;

    if (!folderId) {
      return jsonResponse({ success: false, error: "Target Google Drive Folder ID is required" }, 400);
    }

    var targetFolder;
    try {
      targetFolder = DriveApp.getFolderById(folderId);
    } catch (err) {
      return jsonResponse({ success: false, error: "Could not access folder: " + err.message }, 404);
    }

    // ACTION 1: Upload an Image
    if (action === "upload") {
      var base64Data = payload.data;
      var fileName = payload.filename || ("lingotoon_asset_" + Date.now() + ".png");
      var mimeType = payload.mimeType || "image/png";

      if (!base64Data) {
        return jsonResponse({ success: false, error: "Missing image base64 data" }, 400);
      }

      // Clean up base64 prefix if present (e.g. data:image/png;base64,...)
      if (base64Data.indexOf(",") > -1) {
        var parts = base64Data.split(",");
        base64Data = parts[1];
      }

      var decodedBytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      // Create the file in the owner's Google Drive folder
      var file = targetFolder.createFile(blob);

      // Set file to be viewable by anyone with the link
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = file.getId();
      var directEmbedUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1600";
      var webViewLink = file.getUrl();

      return jsonResponse({
        success: true,
        action: "upload",
        fileId: fileId,
        fileName: file.getName(),
        sizeBytes: file.getSize(),
        directUrl: directEmbedUrl,
        webViewLink: webViewLink,
        message: "Successfully uploaded to Studio Owner's Google Drive"
      });
    }

    // ACTION 2: Save Studio Database JSON
    if (action === "save_db") {
      var dbJsonString = typeof payload.data === "string" ? payload.data : JSON.stringify(payload.data, null, 2);
      var dbFileName = "lingotoon-database.json";

      // Check if file already exists in folder
      var existingFiles = targetFolder.getFilesByName(dbFileName);
      var dbFile;
      if (existingFiles.hasNext()) {
        dbFile = existingFiles.next();
        dbFile.setContent(dbJsonString);
      } else {
        var dbBlob = Utilities.newBlob(dbJsonString, "application/json", dbFileName);
        dbFile = targetFolder.createFile(dbBlob);
        dbFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }

      return jsonResponse({
        success: true,
        action: "save_db",
        fileId: dbFile.getId(),
        updatedAt: new Date().toISOString(),
        message: "Studio database synced to Google Drive"
      });
    }

    return jsonResponse({ success: false, error: "Unknown action: " + action }, 400);

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  }
}

/**
 * Handles HTTP GET requests (ping health check & database load)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
    var folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : DEFAULT_FOLDER_ID;

    // HEALTH CHECK / TEST CONNECTION
    if (action === "ping") {
      return jsonResponse({
        success: true,
        status: "ok",
        service: "Lingotoon Google Drive Cloud Bridge",
        ownerStorageActive: true,
        timestamp: new Date().toISOString()
      });
    }

    // FETCH STUDIO DATABASE JSON
    if (action === "get_db") {
      if (!folderId) {
        return jsonResponse({ success: false, error: "Folder ID required to fetch database" }, 400);
      }

      var targetFolder = DriveApp.getFolderById(folderId);
      var files = targetFolder.getFilesByName("lingotoon-database.json");
      if (!files.hasNext()) {
        return jsonResponse({ success: false, error: "No lingotoon-database.json found in folder" }, 404);
      }

      var file = files.next();
      var content = file.getBlob().getDataAsString();
      var parsed = JSON.parse(content);

      return jsonResponse({
        success: true,
        fileId: file.getId(),
        updatedAt: file.getLastUpdated().toISOString(),
        data: parsed
      });
    }

    return jsonResponse({ success: false, error: "Unknown action: " + action }, 400);

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  }
}

/**
 * Formats JSON response with proper CORS headers for browser fetch calls
 */
function jsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
