import { constants } from "node:fs";
import { open, realpath } from "node:fs/promises";
import path from "node:path";

const files = {
  student: { directory: "Student/PDF", extension: "pdf", title: "Student coursebook (PDF)" },
  faculty: { directory: "Faculty/PDF", extension: "pdf", title: "Faculty teaching and marking guide (PDF)" },
  reader: { directory: "PrivateWeb/Student", extension: "html", title: "Online course reader" },
};

// Published files live in an administrator-managed, read-only private mount.
export async function openTeachingPack(root, code, kind) {
  if (!root || !/^[A-Z0-9][A-Z0-9_-]{1,23}$/.test(code) || !Object.hasOwn(files, kind)) return null;
  const { directory, extension } = files[kind];
  let handle;
  try {
    const filename = path.join(await realpath(root), directory, code + "." + extension);
    if (await realpath(filename) !== filename) return null;
    handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const info = await handle.stat();
    if (info.isFile() && info.size > 0) return handle;
  } catch (error) {
    await handle?.close();
    if (!["ENOENT", "ENOTDIR", "EACCES", "EPERM", "ELOOP"].includes(error.code)) throw error;
    return null;
  }
  await handle?.close();
  return null;
}

export async function listTeachingPacks(root, code, role) {
  if (!root) return [];
  const kinds = role === "student" ? ["reader", "student"] : ["student", "faculty"];
  const packs = await Promise.all(kinds.map(async (kind) => {
    const handle = await openTeachingPack(root, code, kind);
    if (!handle) return null;
    await handle.close();
    const suffix = kind === "reader" ? "teaching-reader" : "teaching-packs/" + kind;
    return { kind, title: files[kind].title, openUrl: "/v1/courses/" + code + "/" + suffix };
  }));
  return packs.filter(Boolean);
}

export async function teachingPacksReady(root, courseCodes) {
  for (const code of courseCodes) {
    for (const kind of Object.keys(files)) {
      const handle = await openTeachingPack(root, code, kind);
      if (!handle) return false;
      await handle.close();
    }
  }
  return true;
}
