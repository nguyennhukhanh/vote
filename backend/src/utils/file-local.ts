import { unlinkSync } from 'node:fs';

import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to the given directory with a unique filename.
 *
 * @param file The file to upload
 * @param directory The directory to upload the file to
 * @returns The path to the uploaded file
 * @example
 * const filePath = await uploadFile(file, 'images');
 */

export async function uploadFile(
  file: File,
  directory: string,
): Promise<string> {
  const [oldName, ext] = file.name.split('.');
  const newFileName = `${oldName}-${uuidv4()}.${ext}`;
  const filePath = `/${directory}/${newFileName}`;
  await Bun.write(`public${filePath}`, file);

  return filePath;
}

/**
 * Deletes a file at the given file path within the 'public' directory.
 *
 * @param filePath The path to the file to delete, relative to the 'public' directory.
 */
export function deleteFile(filePath: string): void {
  unlinkSync(`public${filePath}`);
}
