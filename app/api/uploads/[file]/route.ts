import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  const safeName = path.basename(file);

  if (!safeName || safeName !== file) {
    return new NextResponse("Invalid file name", { status: 400 });
  }

  try {
    const uploadPath = path.join(process.cwd(), "data", "uploads", safeName);
    const body = await readFile(uploadPath);
    const contentType = contentTypes[path.extname(safeName).toLowerCase()] || "application/octet-stream";

    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType
      }
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
