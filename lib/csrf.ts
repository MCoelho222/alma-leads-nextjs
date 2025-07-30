import crypto from "crypto";

// Simple CSRF protection using nonce
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCSRFToken(
  token: string,
  sessionToken: string
): boolean {
  // In a real application, you'd store the token in a session or database
  // For simplicity, we're using a basic time-based validation
  if (!token || !sessionToken) return false;

  try {
    // Basic validation - in production, use proper session management
    const tokenAge = Date.now() - parseInt(token.slice(-13), 16);
    return tokenAge < 3600000 && token === sessionToken; // 1 hour expiry
  } catch {
    return false;
  }
}

export function createTimestampedToken(): string {
  const timestamp = Date.now().toString(16);
  const randomBytes = crypto.randomBytes(16).toString("hex");
  return randomBytes + timestamp;
}
