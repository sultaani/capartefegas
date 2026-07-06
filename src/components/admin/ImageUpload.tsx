"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;        // current image URL (shown as preview)
  publicId?: string;    // Cloudinary public_id of the current image
  onChange: (url: string, publicId: string) => void;
  aspectClass?: string; // e.g. "aspect-[4/3]" or "aspect-[4/5]"
}

export function ImageUpload({
  value,
  publicId = "",
  onChange,
  aspectClass = "aspect-[4/3]",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    // 5 MB client-side guard — Cloudinary free tier upload limit is 10 MB,
    // but most product photos should be well under 5 MB.
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      // Step 1 — get a signed-upload signature from our server so the browser
      // can upload directly to Cloudinary without exposing the API secret.
      const sigRes = await fetch("/api/admin/cloudinary-signature", { method: "POST" });
      if (!sigRes.ok) throw new Error("Could not get upload signature. Check that CLOUDINARY_* variables are set in .env.");
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

      // Step 2 — upload directly from the browser to Cloudinary.
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", String(timestamp));
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "Cloudinary upload failed.");
      }
      const data = await uploadRes.json();
      onChange(data.secure_url, data.public_id);
    } catch (err: any) {
      setError(err.message || "Upload failed — please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div>
      {value ? (
        <div className={`relative w-full ${aspectClass} bg-neutral-100 overflow-hidden mb-2`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("", "")}
            aria-label="Remove image"
            className="absolute top-2 right-2 bg-white/90 p-1 hover:bg-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white px-3 py-1 text-xs uppercase tracking-wide cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            {uploading ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</> : <><Upload className="w-3 h-3" /> Replace</>}
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={`w-full ${aspectClass} border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-colors`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
              <span className="text-xs text-neutral-500">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-neutral-400" />
              <span className="text-xs text-neutral-500 text-center px-4">
                Click to upload or drag &amp; drop<br />
                <span className="text-neutral-400">PNG, JPG, WEBP — max 5 MB</span>
              </span>
            </>
          )}
        </div>
      )}
      {error && <div className="text-xs text-red-700 mt-1">{error}</div>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // Reset so the same file can be re-selected if needed
          e.target.value = "";
        }}
      />
    </div>
  );
}
