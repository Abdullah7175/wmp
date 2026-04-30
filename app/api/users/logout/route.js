import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";

// This route handles user logout by clearing all session data
export async function POST(request) {
  try {
    // Get current session before clearing it
    const session = await auth();
    const userId = session?.user?.id;

    // Create response with success message
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear all session-related cookies
    // NextAuth session token (multiple possible names)
    response.cookies.set("next-auth.session-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("__Secure-next-auth.session-token", "", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("authjs.session-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("__Secure-authjs.session-token", "", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 0,
    });

    // Clear legacy JWT token if present
    response.cookies.set("jwtToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    // Log the logout action if userId is available
    if (userId) {
      console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
    }

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { error: "Error during logout" },
      { status: 500 }
    );
  }
}

// Also support GET method for backward compatibility
export async function GET(request) {
  return POST(request);
}
