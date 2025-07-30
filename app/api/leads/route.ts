import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Server-side validation functions
const validateInput = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Sanitize and validate firstName
  if (!data.firstName || typeof data.firstName !== "string") {
    errors.push("First name is required");
  } else {
    const trimmed = data.firstName.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      errors.push("First name must be between 2 and 50 characters");
    }
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
      errors.push("First name contains invalid characters");
    }
  }

  // Sanitize and validate lastName
  if (!data.lastName || typeof data.lastName !== "string") {
    errors.push("Last name is required");
  } else {
    const trimmed = data.lastName.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      errors.push("Last name must be between 2 and 50 characters");
    }
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
      errors.push("Last name contains invalid characters");
    }
  }

  // Validate email
  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required");
  } else {
    const trimmed = data.email.trim().toLowerCase();
    if (trimmed.length < 5 || trimmed.length > 100) {
      errors.push("Email must be between 5 and 100 characters");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      errors.push("Invalid email format");
    }
  }

  // Validate country
  if (!data.country || typeof data.country !== "string") {
    errors.push("Country is required");
  } else {
    const trimmed = data.country.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      errors.push("Country must be between 2 and 100 characters");
    }
  }

  // Validate website (optional)
  if (data.website && typeof data.website === "string") {
    const trimmed = data.website.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > 200) {
        errors.push("Website URL is too long");
      }
      // Basic URL validation
      const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      const simplePattern =
        /^(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(\/.*)?$/;
      if (!urlPattern.test(trimmed) && !simplePattern.test(trimmed)) {
        errors.push("Invalid website URL format");
      }
    }
  }

  // Validate reason
  if (!data.reason || typeof data.reason !== "string") {
    errors.push("Reason is required");
  } else {
    const trimmed = data.reason.trim();
    if (trimmed.length < 10 || trimmed.length > 1000) {
      errors.push("Reason must be between 10 and 1000 characters");
    }
  }

  // Validate categories
  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    errors.push("At least one category must be selected");
  } else {
    const validCategories = [
      "Employment Based (EB-1, EB-2, EB-3)",
      "Family Based (F-1, F-2A, F-2B, F-3, F-4)",
      "Investor Visas (EB-5)",
      "Student Visas (F-1)",
      "Visitor/Tourist Visas (B-1/B-2)",
      "Work Visas (H-1B, L-1, O-1, etc.)",
      "Other",
    ];

    for (const category of data.categories) {
      if (typeof category !== "string" || !validCategories.includes(category)) {
        errors.push("Invalid category selected");
        break;
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};

const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (file.size > maxSize) {
    return { isValid: false, error: "File size must be less than 5MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Only PDF, DOC, DOCX, and TXT files are allowed",
    };
  }

  return { isValid: true };
};

// Simple rate limiting (in production, use Redis or a proper rate limiting service)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per 15 minutes

const checkRateLimit = (
  ip: string
): { allowed: boolean; resetTime?: number } => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: userLimit.resetTime };
  }

  userLimit.count++;
  return { allowed: true };
};

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // Check rate limit
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime! - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }
    const formData = await req.formData();

    // Extract and validate file
    const file = formData.get("resume") as File | null;
    let buffer: Buffer | null = null;

    if (file && file.size > 0) {
      const fileValidation = validateFile(file);
      if (!fileValidation.isValid) {
        return NextResponse.json(
          { error: fileValidation.error },
          { status: 400 }
        );
      }
      buffer = Buffer.from(await file.arrayBuffer());
    }

    // Extract and sanitize form data
    const rawData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      country: formData.get("country"),
      website: formData.get("website") || "",
      reason: formData.get("reason"),
      categories: formData.getAll("categories"),
    };

    // Server-side validation
    const validation = validateInput(rawData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Sanitize data for database insertion
    const leadData = {
      firstName: (rawData.firstName as string).trim(),
      lastName: (rawData.lastName as string).trim(),
      email: (rawData.email as string).trim().toLowerCase(),
      country: (rawData.country as string).trim(),
      website: (rawData.website as string).trim(),
      reason: (rawData.reason as string).trim(),
      categories: rawData.categories.map((cat) => String(cat).trim()),
      resume: buffer,
    };

    const lead = await prisma.lead.create({
      data: leadData,
    });

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully",
      id: lead.id,
    });
  } catch (error) {
    // Log detailed error for debugging (server-side only)
    console.error("Lead creation error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      timestamp: new Date().toISOString(),
    });

    // Return generic error message to client (security best practice)
    return NextResponse.json(
      {
        error:
          "An error occurred while processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
