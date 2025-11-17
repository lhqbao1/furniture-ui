// // pages/api/upload-images.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { google } from "googleapis";
// import { Readable } from "stream";

// const parentFolderId = process.env.DRIVE_PARENT_FOLDER_ID;
// const apiKey = process.env.API_TRIGGER_KEY;
// const baseUrl = process.env.BASE_URL || "http://localhost:3000";
// const productExportPath =
//   process.env.PRODUCT_EXPORT_PATH || "/api/internal/export-images";

// if (!parentFolderId) {
//   console.warn("DRIVE_PARENT_FOLDER_ID is missing!");
// }

// function sanitizeFolderName(name: string) {
//   return name.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 120);
// }

// function mimeTypeFromExt(ext: string) {
//   ext = ext.toLowerCase();
//   switch (ext) {
//     case "jpg":
//     case "jpeg":
//       return "image/jpeg";
//     case "png":
//       return "image/png";
//     case "gif":
//       return "image/gif";
//     case "webp":
//       return "image/webp";
//     case "svg":
//       return "image/svg+xml";
//     default:
//       return "application/octet-stream";
//   }
// }

// async function getServiceAccountAuth() {
//   const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
//   if (!keyJson) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");

//   let key: any = keyJson;

//   // detect base64 or raw JSON
//   try {
//     if (!keyJson.trim().startsWith("{")) {
//       key = JSON.parse(Buffer.from(keyJson, "base64").toString("utf8"));
//     } else {
//       key = JSON.parse(keyJson);
//     }
//   } catch (err) {
//     throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON");
//   }

//   const jwtClient = new google.auth.JWT({
//     email: key.client_email,
//     key: key.private_key,
//     scopes: ["https://www.googleapis.com/auth/drive"],
//   });

//   await jwtClient.authorize();
//   return jwtClient;
// }

// async function ensureFolderExists(drive: any, name: string, parentId: string) {
//   const q = `'${parentId}' in parents and name = '${name.replace(
//     "'",
//     "\\'",
//   )}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

//   const res = await drive.files.list({
//     q,
//     fields: "files(id,name)",
//   });

//   if (res.data.files?.length > 0) {
//     return res.data.files[0].id;
//   }

//   const created = await drive.files.create({
//     requestBody: {
//       name,
//       parents: [parentId],
//       mimeType: "application/vnd.google-apps.folder",
//     },
//     fields: "id",
//   });

//   return created.data.id!;
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   if (req.method !== "POST")
//     return res.status(405).json({ ok: false, message: "Method not allowed" });

//   const providedKey = req.headers["x-api-key"] || req.query.key;
//   if (!apiKey || providedKey !== apiKey) {
//     return res.status(401).json({ ok: false, message: "Unauthorized" });
//   }

//   try {
//     // fetch product list
//     const exportRes = await fetch(`${baseUrl}${productExportPath}`);

//     if (!exportRes.ok) {
//       return res
//         .status(500)
//         .json({ ok: false, message: "Cannot fetch product data" });
//     }

//     const exportData = await exportRes.json();

//     if (!Array.isArray(exportData)) {
//       return res
//         .status(500)
//         .json({ ok: false, message: "Invalid product list" });
//     }

//     const auth = await getServiceAccountAuth();
//     const drive = google.drive({ version: "v3", auth });

//     let uploadCount = 0;

//     for (const item of exportData) {
//       const folderName = sanitizeFolderName(`${item.id_provider}-${item.name}`);
//       const folderId = await ensureFolderExists(
//         drive,
//         folderName,
//         parentFolderId!,
//       );

//       const files = item.static_files || [];

//       for (const [idx, file] of files.entries()) {
//         try {
//           const img = await fetch(file.url);
//           if (!img.ok) continue;

//           const buffer = Buffer.from(await img.arrayBuffer());

//           const match = file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
//           const ext = match ? match[1] : "jpg";

//           await drive.files.create({
//             requestBody: {
//               name: `image_${idx + 1}.${ext}`,
//               parents: [folderId],
//             },
//             media: {
//               mimeType: mimeTypeFromExt(ext),
//               body: Readable.from(buffer),
//             },
//           });

//           uploadCount++;
//         } catch (err) {
//           console.error("Upload error:", err);
//         }
//       }
//     }

//     return res.status(200).json({
//       ok: true,
//       uploaded: uploadCount,
//       totalProducts: exportData.length,
//     });
//   } catch (err) {
//     console.error("Upload error:", err);
//     return res.status(500).json({ ok: false, error: String(err) });
//   }
// }
