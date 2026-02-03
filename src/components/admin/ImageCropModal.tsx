"use client";

import Cropper from "react-easy-crop";
import { useState } from "react";

type Props = {
  file: File;
  onCancel: () => void;
  onCropped: (file: File) => void;
};

export default function ImageCropModal({ file, onCancel, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  function onCropComplete(_: any, pixels: any) {
    setCroppedAreaPixels(pixels);
  }

  async function finishCrop() {
    const image = new Image();
    image.src = URL.createObjectURL(file);

    await new Promise((r) => (image.onload = r));

    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      onCropped(
        new File([blob], file.name, { type: file.type })
      );
    }, file.type);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-white rounded-xl p-4 w-[400px] h-[450px] flex flex-col">
        <div className="relative flex-1">
          <Cropper
            image={URL.createObjectURL(file)}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex justify-end gap-3 mt-3">
          <button onClick={onCancel} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={finishCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
}
