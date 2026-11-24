// Files in a pinned pack are server inputs. Routes select the fields and files
// a viewer may receive. No path from a request is used as a filename.
import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "../lib/errors.js";

const courseCodePattern = /^[A-Z0-9][A-Z0-9_-]{1,23}$/;
const versionPattern = /^\d+\.\d+\.\d+$/;
const unusable = () => new ApiError(503,"PACK_UNAVAILABLE","The pinned course materials are temporarily unavailable.");

async function checkedFile(root, relative, digest) {
  if (!/^[a-f0-9]{64}$/.test(digest)) throw unusable();
  if (!root || !relative || path.isAbsolute(relative) || relative.split(/[\\/]/).some(p=>!p || p==="." || p==="..")) throw unusable();
  try {
    const base = await realpath(root);
    const file = path.join(base,relative);
    if (await realpath(file) !== file || !file.startsWith(base + path.sep)) throw unusable();
    const bytes = await readFile(file);
    if (createHash("sha256").update(bytes).digest("hex") !== digest) throw unusable();
    return bytes;
  } catch { throw unusable(); }
}

export async function loadCoursePack(code, pin, root) {
  if (!courseCodePattern.test(code) || !pin || !versionPattern.test(pin.version) || !/^[a-f0-9]{64}$/.test(pin.sha256)) throw unusable();
  const prefix = `packs/${code}/${pin.version}/`;
  const manifest = JSON.parse(await checkedFile(root,prefix + "manifest.json",pin.sha256));
  if(manifest.code!==code || manifest.version!==pin.version || !manifest.policy?.version_lock) throw unusable();
  const marking = JSON.parse(await checkedFile(root,`marking/${code}/${pin.version}.json`,manifest.markingSha256));
  return {
    manifest, marking,
    worksheet: unit => checkedFile(root,prefix+unit.worksheet.path,unit.worksheet.sha256),
    source: descriptor => checkedFile(root,prefix+"sources/"+descriptor.name,descriptor.digest)
  };
}
