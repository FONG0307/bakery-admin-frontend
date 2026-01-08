"use client";

import { uploadVideo } from "@/lib/upload";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";

export default function AdminVideoUploadPage() {
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadVideo(file);
      console.log("Uploaded:", result.file_url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Label>Upload video</Label>
      <FileInput onChange={handleFileChange} />
    </>
  );
}
