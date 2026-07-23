import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { ApiError } from "./errors.js";

const allowed = new Map([
  ["pdf", new Set(["application/pdf"])],
  ["docx", new Set(["application/vnd.openxmlformats-officedocument.wordprocessingml.document"])],
  ["xlsx", new Set(["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"])],
  ["pptx", new Set(["application/vnd.openxmlformats-officedocument.presentationml.presentation"])],
  ["png", new Set(["image/png"])],
  ["jpg", new Set(["image/jpeg"])],
  ["jpeg", new Set(["image/jpeg"])],
  ["txt", new Set(["text/plain"])],
]);

function safeOriginalName(value) {
  return path.basename(String(value || "upload").normalize("NFKC"));
}

export async function validateUploadedFile(file) {
  const originalName = safeOriginalName(file.filename);
  const extension = path.extname(originalName).slice(1).toLowerCase();
  const acceptedMimes = allowed.get(extension);
  if (!acceptedMimes) {
    throw new ApiError(
      422,
      "UNSUPPORTED_FILE_TYPE",
      "Use PDF, DOCX, XLSX, PPTX, TXT, PNG or JPEG files.",
      [{ field: "files", reason: `.${extension || "unknown"} is not allowed` }],
    );
  }

  const detected = await fileTypeFromBuffer(file.buffer);
  let mimeType = detected?.mime || file.mimetype || "application/octet-stream";
  if (extension === "txt") {
    if (file.buffer.includes(0)) {
      throw new ApiError(422, "MIME_MISMATCH", "The text file contains binary data.");
    }
    mimeType = "text/plain";
  }
  if (!acceptedMimes.has(mimeType)) {
    throw new ApiError(
      422,
      "MIME_MISMATCH",
      "The file contents do not match the filename extension.",
      [{ field: "files", reason: `${originalName} was detected as ${mimeType}` }],
    );
  }
  return { originalName, extension, mimeType };
}
