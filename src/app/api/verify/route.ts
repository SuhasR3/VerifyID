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
    const msg = error instanceof Error ? error.message : String(error);

    // Surface user-friendly error messages
    let userError = "Verification failed. Please try again.";
    let status = 500;

    if (msg.includes("429") || msg.includes("quota") || msg.includes("rate") || msg.includes("Rate limit")) {
      userError = "AI service rate limit reached. Please wait a moment and try again.";
      status = 429;
    } else if (msg.includes("API key") || msg.includes("GEMINI_API_KEY")) {
      userError = "AI service not configured. Contact support.";
      status = 503;
    } else if (msg.includes("JSON") || msg.includes("parse")) {
      userError = "AI returned an unexpected response. Please try again.";
    }

    return Response.json(
      {
        error: userError,
        detail: msg,
        processingTime: Date.now() - startTime,
      },
      { status }
    );
  }
}
