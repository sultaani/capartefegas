"use client";
import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface Props { value:string; publicId?:string; onChange:(url:string,publicId:string)=>void; aspectClass?:string; }

export function ImageUpload({ value, publicId="", onChange, aspectClass="aspect-[4/3]" }:Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file:File) {
    if (file.size > 5*1024*1024){ setError("Image must be under 5 MB."); return; }
    setUploading(true); setError(null);
    try {
      const sigRes = await fetch("/api/admin/cloudinary-signature",{ method:"POST" });
      if (!sigRes.ok) throw new Error("Could not get upload signature. Check CLOUDINARY_* vars in .env.");
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();
      const fd = new FormData();
      fd.append("file",file); fd.append("signature",signature);
      fd.append("timestamp",String(timestamp)); fd.append("api_key",apiKey); fd.append("folder",folder);
      const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{ method:"POST", body:fd });
      if (!up.ok) throw new Error("Cloudinary upload failed.");
      const d = await up.json();
      onChange(d.secure_url, d.public_id);
    } catch(e:any){ setError(e.message||"Upload failed."); }
    finally { setUploading(false); }
  }

  return (
    <div>
      {value ? (
        <div className={`relative w-full ${aspectClass} bg-neutral-100 overflow-hidden mb-2`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover"/>
          <button type="button" onClick={()=>onChange("","")} aria-label="Remove" className="absolute top-2 right-2 bg-white/90 p-1 hover:bg-white cursor-pointer"><X className="w-4 h-4"/></button>
          <button type="button" onClick={()=>ref.current?.click()} disabled={uploading} className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white px-3 py-1 text-xs uppercase tracking-wide cursor-pointer flex items-center gap-1 disabled:opacity-50">
            {uploading?<><Loader2 className="w-3 h-3 animate-spin"/>Uploading…</>:<><Upload className="w-3 h-3"/>Replace</>}
          </button>
        </div>
      ) : (
        <div onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f&&f.type.startsWith("image/"))handleFile(f);}} onDragOver={e=>e.preventDefault()} onClick={()=>ref.current?.click()}
          className={`w-full ${aspectClass} border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-colors`}>
          {uploading?<><Loader2 className="w-6 h-6 animate-spin text-neutral-400"/><span className="text-xs text-neutral-500">Uploading…</span></>
            :<><Upload className="w-6 h-6 text-neutral-400"/><span className="text-xs text-neutral-500 text-center px-4">Click to upload or drag &amp; drop<br/><span className="text-neutral-400">PNG, JPG, WEBP — max 5 MB</span></span></>}
        </div>
      )}
      {error && <div className="text-xs text-red-700 mt-1">{error}</div>}
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value="";}}/>
    </div>
  );
}
