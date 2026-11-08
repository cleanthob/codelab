import { cloudinary } from "./cloudinary";

export async function uploadImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "codelab/courses",
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
