import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  // SECURITY: This legacy endpoint is deprecated and disabled to eliminate credential brute-forcing.
  // The application authenticates through NextAuth (/api/auth) and /api/mobile/auth.
  return NextResponse.json(
    { error: "This login endpoint has been deprecated and disabled for security. Please use the official login portal." },
    { status: 410 }
  );
}

export async function GET(req) {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}