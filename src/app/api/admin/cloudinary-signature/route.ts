import { NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";

// The admin image picker calls this before uploading directly to
// Cloudinary from the browser, so large files never pass through our
// server. folder is fixed server-side so the client can't redirect
// uploads elsewhere.
export async function POST() {
  const folder = "capartefegas";
  const { signature, timestamp, apiKey, cloudName } = generateUploadSignature({ folder });
  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
