import { POST } from "@/app/api/leads/route";

// Mock the database
jest.mock("@/lib/db", () => ({
  prisma: {
    lead: {
      create: jest.fn(),
    },
  },
}));

// Import the mocked prisma
import { prisma } from "@/lib/db";
const mockCreate = prisma.lead.create as jest.Mock;

describe("/api/leads POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear rate limit map by resetting modules
    jest.resetModules();
    // Also clear any module cache for the route to ensure fresh rate limiting state
    delete require.cache[require.resolve("@/app/api/leads/route")];
  });

  const createFormData = (data: Record<string, any>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return formData;
  };

  const createMockRequest = (
    formData: FormData,
    headers: Record<string, string> = {},
    ip: string = Math.random().toString(36).substring(7) // Generate random IP for each test
  ) => {
    return {
      formData: async () => formData,
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === "x-forwarded-for") return ip;
          return headers[name.toLowerCase()] || null;
        },
      },
      method: "POST",
      url: "http://localhost:3000/api/leads",
    } as any;
  };

  describe("Successful Submissions", () => {
    it("should successfully submit a complete form with all fields", async () => {
      const mockLead = { id: 1 };
      mockCreate.mockResolvedValue(mockLead as any);

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        country: "United States",
        website: "https://johndoe.com",
        reason:
          "I am seeking immigration assistance for my O-1 visa application.",
        categories: ["O-1", "EB-1A"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Lead submitted successfully");
      expect(result.id).toBe(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          country: "United States",
          website: "https://johndoe.com",
          reason:
            "I am seeking immigration assistance for my O-1 visa application.",
          categories: ["O-1", "EB-1A"],
          resume: null,
        },
      });
    });

    it("should successfully submit form with minimal required fields", async () => {
      const mockLead = { id: 2 };
      mockCreate.mockResolvedValue(mockLead as any);

      const formData = createFormData({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        country: "Canada",
        reason: "Need immigration help for my visa application process.",
        categories: ["I don't know"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          country: "Canada",
          website: "",
          reason: "Need immigration help for my visa application process.",
          categories: ["I don't know"],
          resume: null,
        },
      });
    });

    it("should successfully submit form with PDF file", async () => {
      const mockLead = { id: 3 };
      mockCreate.mockResolvedValue(mockLead as any);

      // Create a mock PDF file
      const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF header
      const file = new File([pdfContent], "resume.pdf", {
        type: "application/pdf",
      });

      const formData = createFormData({
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        country: "United Kingdom",
        reason: "Seeking EB-2 NIW assistance for my application.",
        categories: ["EB-2 NIW"],
        resume: file,
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice@example.com",
          country: "United Kingdom",
          reason: "Seeking EB-2 NIW assistance for my application.",
          categories: ["EB-2 NIW"],
          resume: expect.any(Buffer),
        }),
      });
    });
  });

  describe("Validation Edge Cases", () => {
    it("should reject submission with missing required fields", async () => {
      const formData = createFormData({
        firstName: "John",
        // Missing lastName, email, country, reason, categories
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("Validation failed");
      expect(result.details).toContain("Last name is required");
      expect(result.details).toContain("Email is required");
      expect(result.details).toContain("Country is required");
      expect(result.details).toContain("Reason is required");
      expect(result.details).toContain(
        "At least one category must be selected"
      );
    });

    it("should reject submission with invalid email format", async () => {
      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "invalid-email",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.details).toContain("Invalid email format");
    });

    it("should reject submission with invalid category", async () => {
      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["Invalid Category"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.details).toContain("Invalid category selected");
    });

    it("should reject submission with names containing invalid characters", async () => {
      const formData = createFormData({
        firstName: "John123",
        lastName: "Doe@#$",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.details).toContain(
        "First name contains invalid characters"
      );
      expect(result.details).toContain("Last name contains invalid characters");
    });

    it("should reject submission with too short reason", async () => {
      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Short",
        categories: ["O-1"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.details).toContain(
        "Reason must be between 10 and 1000 characters"
      );
    });

    it("should reject submission with too long fields", async () => {
      const formData = createFormData({
        firstName: "A".repeat(51), // Too long
        lastName: "Doe",
        email: "a".repeat(100) + "@example.com", // Too long
        country: "USA",
        reason: "A".repeat(1001), // Too long
        categories: ["O-1"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.details).toContain(
        "First name must be between 2 and 50 characters"
      );
      expect(result.details).toContain(
        "Email must be between 5 and 100 characters"
      );
      expect(result.details).toContain(
        "Reason must be between 10 and 1000 characters"
      );
    });

    it("should reject submission with invalid website URL", async () => {
      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        website: "not-a-valid-url",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.details).toContain("Invalid website URL format");
    });
  });

  describe("File Upload Edge Cases", () => {
    it("should reject file that is too large", async () => {
      // Create a mock file larger than 5MB
      const largeContent = new Uint8Array(6 * 1024 * 1024); // 6MB
      const file = new File([largeContent], "large-resume.pdf", {
        type: "application/pdf",
      });

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
        resume: file,
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("File size must be less than 5MB");
    });

    it("should reject file with invalid type", async () => {
      const file = new File(["content"], "resume.jpg", { type: "image/jpeg" });

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
        resume: file,
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe(
        "Only PDF, DOC, DOCX, and TXT files are allowed"
      );
    });

    it("should accept valid file types", async () => {
      const mockLead = { id: 4 };
      mockCreate.mockResolvedValue(mockLead as any);

      const validTypes = [
        { content: "PDF content", name: "resume.pdf", type: "application/pdf" },
        {
          content: "DOC content",
          name: "resume.doc",
          type: "application/msword",
        },
        {
          content: "DOCX content",
          name: "resume.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
        { content: "TXT content", name: "resume.txt", type: "text/plain" },
      ];

      for (const fileType of validTypes) {
        jest.clearAllMocks();

        const file = new File([fileType.content], fileType.name, {
          type: fileType.type,
        });
        const formData = createFormData({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          country: "USA",
          reason: "Need immigration help",
          categories: ["O-1"],
          resume: file,
        });

        const request = createMockRequest(formData);
        const response = await POST(request);

        expect(response.status).toBe(200);
      }
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      // Additional cleanup for rate limiting tests
      jest.resetModules();
      delete require.cache[require.resolve("@/app/api/leads/route")];
    });

    it("should enforce rate limiting after 5 requests", async () => {
      const mockLead = { id: 5 };
      mockCreate.mockResolvedValue(mockLead as any);

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      // Make 5 successful requests with consistent IP
      const testIP = "192.168.1.1";
      for (let i = 0; i < 5; i++) {
        const request = createMockRequest(
          formData,
          {
            "x-forwarded-for": testIP,
          },
          testIP
        );
        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // 6th request should be rate limited
      const request = createMockRequest(
        formData,
        {
          "x-forwarded-for": testIP,
        },
        testIP
      );
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.error).toBe("Too many requests. Please try again later.");
      expect(response.headers.get("Retry-After")).toBeTruthy();
    });

    it("should allow requests from different IPs", async () => {
      const mockLead = { id: 6 };
      mockCreate.mockResolvedValue(mockLead as any);

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      // Make 5 requests from first IP (use different IP than previous test)
      const firstIP = "10.0.0.1";
      for (let i = 0; i < 5; i++) {
        const request = createMockRequest(
          formData,
          {
            "x-forwarded-for": firstIP,
          },
          firstIP
        );
        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // Request from different IP should succeed
      const secondIP = "10.0.0.2";
      const request = createMockRequest(
        formData,
        {
          "x-forwarded-for": secondIP,
        },
        secondIP
      );
      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe("Database Error Handling", () => {
    it("should handle database connection errors gracefully", async () => {
      mockCreate.mockRejectedValue(new Error("Database connection failed"));

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe(
        "An error occurred while processing your request. Please try again."
      );
    });

    it("should handle unique constraint violations", async () => {
      const uniqueConstraintError = new Error("Unique constraint failed");
      (uniqueConstraintError as any).code = "P2002";
      mockCreate.mockRejectedValue(uniqueConstraintError);

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe(
        "An error occurred while processing your request. Please try again."
      );
    });
  });

  describe("Security and Edge Cases", () => {
    it("should sanitize input data", async () => {
      const mockLead = { id: 7 };
      mockCreate.mockResolvedValue(mockLead as any);

      const formData = createFormData({
        firstName: "  John  ",
        lastName: "  Doe  ",
        email: "  JOHN@EXAMPLE.COM  ",
        country: "  USA  ",
        website: "  https://example.com  ",
        reason: "  Need immigration help  ",
        categories: ["O-1"],
      });

      const request = createMockRequest(formData);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          country: "USA",
          website: "https://example.com",
          reason: "Need immigration help",
          categories: ["O-1"],
          resume: null,
        },
      });
    });

    it("should handle malformed request data", async () => {
      const request = {
        formData: async () => {
          throw new Error("Cannot parse form data");
        },
        headers: {
          get: () => "127.0.0.1",
        },
        method: "POST",
        url: "http://localhost:3000/api/leads",
      } as any;

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe(
        "An error occurred while processing your request. Please try again."
      );
    });
  });
});
