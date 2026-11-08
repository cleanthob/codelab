"use server";

import { createId } from "@paralleldrive/cuid2";
import { cloudinary } from "../lib/cloudinary";

export async function uploadImage(file: File) {
  const fileId = createId();
  const fileMaxSize = 1024 * 1024 * 5;

  if (file.size > fileMaxSize) {
    throw new Error("File size is too large");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "codelab/courses",
          public_id: fileId,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(buffer);
  });

  return result;
}
