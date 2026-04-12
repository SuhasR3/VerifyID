import { NextRequest } from "next/server";
import { verifyID } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json(
        { error: "Invalid request: send multipart/form-data." },
        { status: 400 }
      );
    }

    const idImageFile = formData.get("idImage") as File | null;
    const secondDocFile = formData.get("secondDocument") as File | null;

    if (!idImageFile || typeof idImageFile === "string") {
      return Response.json(
        { error: "Missing required field: idImage (must be a file upload)." },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (idImageFile.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "File too large. Maximum 20 MB." },
        { status: 413 }
      );
    }
    if (secondDocFile && typeof secondDocFile !== "string" && secondDocFile.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "Second file too large. Maximum 20 MB." },
        { status: 413 }
      );
    }

    const validSecondDoc =
      secondDocFile && typeof secondDocFile !== "string" ? secondDocFile : null;

    const parsed = await verifyID(idImageFile, validSecondDoc);

    const result = {
      ...parsed,
      processingTime: Date.now() - startTime,
    };

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Verification API error:", error);
    return Response.json(
      {
        error: "Verification failed",
        detail: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
