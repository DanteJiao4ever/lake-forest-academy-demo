/**
 * Example PUBLIC browser configuration for Lake Forest Learning.
 *
 * Every value in this object is visible to anyone who loads the GitHub Pages
 * site. Never include a Google client secret, service-account key, OAuth token,
 * database password, session signing key, or secret-manager reference here.
 */
window.LFA_DRIVE_CONFIG = Object.freeze({
  sourceName: "Lotus Drive",

  // Display/navigation metadata only. The backend must independently enforce
  // which Drive source James is allowed to sync.
  rootFolderId: "1ExampleCoursesFolderId",
  rootFolderUrl:
    "https://drive.google.com/drive/folders/1ExampleCoursesFolderId",

  // These HTTPS endpoints belong to the authenticated school backend.
  materialsEndpoint:
    "https://api.lakeforestacademy.ca/v1/materials",
  syncEndpoint:
    "https://api.lakeforestacademy.ca/v1/admin/drive/sources/237d4ec2-ce04-4fd0-b4c6-d38e6d0f103b/sync",
});
