import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `mbr/store/${id}`, resource_type: "image" },
      (err, res) => { if (err || !res) reject(err); else resolve(res as { secure_url: string; public_id: string }); }
    ).end(buffer);
  });

  const image = await prisma.listingImage.create({
    data: { listingId: id, url: result.secure_url, filename: file.name },
  });
  return NextResponse.json(image, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const images = await prisma.listingImage.findMany({ where: { listingId: id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(images);
}
