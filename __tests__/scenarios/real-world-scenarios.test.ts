/**
 * Real-world scenario tests for form submission
 * These tests simulate actual user behavior and edge cases
 */

// Helper function for form validation
const createCompleteValidationSuite = () => {
  return {
    validateForm: (formData: any): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Name validation
      if (!formData.firstName || typeof formData.firstName !== "string") {
        errors.push("First name is required");
      } else {
        const firstName = formData.firstName.trim();
        if (firstName.length < 2 || firstName.length > 50) {
          errors.push("First name must be between 2 and 50 characters");
        }
        if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
          errors.push("First name contains invalid characters");
        }
      }

      if (!formData.lastName || typeof formData.lastName !== "string") {
        errors.push("Last name is required");
      } else {
        const lastName = formData.lastName.trim();
        if (lastName.length < 2 || lastName.length > 50) {
          errors.push("Last name must be between 2 and 50 characters");
        }
        if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
          errors.push("Last name contains invalid characters");
        }
      }

      // Email validation
      if (!formData.email || typeof formData.email !== "string") {
        errors.push("Email is required");
      } else {
        const email = formData.email.trim();
        if (email.length < 5 || email.length > 100) {
          errors.push("Email must be between 5 and 100 characters");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push("Invalid email format");
        }
      }

      // Country validation
      if (!formData.country || typeof formData.country !== "string") {
        errors.push("Country is required");
      } else {
        const country = formData.country.trim();
        if (country.length < 2 || country.length > 100) {
          errors.push("Country must be between 2 and 100 characters");
        }
      }

      // Website validation (optional)
      if (formData.website && typeof formData.website === "string") {
        const website = formData.website.trim();
        if (website.length > 0) {
          if (website.length > 200) {
            errors.push("Website URL is too long");
          }
          const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
          const simplePattern =
            /^(www\.)?[a-zA-Z0-9][a-zA-Z0-9.-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
          if (!urlPattern.test(website) && !simplePattern.test(website)) {
            errors.push("Invalid website URL format");
          }
        }
      }

      // Reason validation
      if (!formData.reason || typeof formData.reason !== "string") {
        errors.push("Reason is required");
      } else {
        const reason = formData.reason.trim();
        if (reason.length < 10 || reason.length > 1000) {
          errors.push("Reason must be between 10 and 1000 characters");
        }
      }

      // Categories validation
      if (!Array.isArray(formData.categories) || formData.categories.length === 0) {
        errors.push("At least one category must be selected");
      } else {
        const validCategories = ["O-1", "EB-1A", "EB-2 NIW", "I don't know"];
        for (const category of formData.categories) {
          if (typeof category !== "string" || !validCategories.includes(category)) {
            errors.push("Invalid category selected");
            break;
          }
        }
      }

      return { isValid: errors.length === 0, errors };
    },
  };
};

describe("Real-World Form Submission Scenarios", () => {
  describe("Typical User Journeys", () => {
    it("should handle successful O-1 visa application", () => {
      const validator = createCompleteValidationSuite();

      const o1Application = {
        firstName: "Maria",
        lastName: "Rodriguez",
        email: "maria.rodriguez@techcompany.com",
        country: "Mexico",
        website: "https://linkedin.com/in/maria-rodriguez",
        reason:
          "I am a software engineer with extraordinary ability in artificial intelligence. I have published several papers and hold multiple patents in machine learning.",
        categories: ["O-1"],
      };

      const result = validator.validateForm(o1Application);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle successful EB-1A application with multiple categories", () => {
      const validator = createCompleteValidationSuite();

      const eb1aApplication = {
        firstName: "John",
        lastName: "Smith-Williams",
        email: "j.smith.williams@university.edu",
        country: "United Kingdom",
        website: "www.researchgate.net/profile/john-smith-williams",
        reason:
          "I am a research scientist with extraordinary ability in biotechnology. I have received international recognition for my work in gene therapy and have been awarded prestigious grants.",
        categories: ["EB-1A", "O-1"],
      };

      const result = validator.validateForm(eb1aApplication);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle EB-2 NIW application", () => {
      const validator = createCompleteValidationSuite();

      const eb2niwApplication = {
        firstName: "Sarah",
        lastName: "O'Connor",
        email: "sarah.oconnor@startup.com",
        country: "Ireland",
        website: "https://github.com/sarah-oconnor",
        reason:
          "I am proposing to work on renewable energy solutions that will benefit the United States. My background in electrical engineering and clean technology makes me well-suited for EB-2 NIW.",
        categories: ["EB-2 NIW"],
      };

      const result = validator.validateForm(eb2niwApplication);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle uncertain applicant", () => {
      const validator = createCompleteValidationSuite();

      const uncertainApplication = {
        firstName: "Alex",
        lastName: "Chen",
        email: "alex.chen@email.com",
        country: "Canada",
        reason:
          "I am not sure which visa category would be best for me. I work in technology and have some achievements, but I would like professional guidance on my options.",
        categories: ["I don't know"],
      };

      const result = validator.validateForm(uncertainApplication);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Common User Mistakes", () => {
    const validator = createCompleteValidationSuite();

    it("should catch incomplete form submission", () => {
      const incompleteForm = {
        firstName: "John",
        email: "john@example.com",
        // Missing lastName, country, reason, categories
      };

      const result = validator.validateForm(incompleteForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Last name is required");
      expect(result.errors).toContain("Country is required");
      expect(result.errors).toContain("Reason is required");
      expect(result.errors).toContain("At least one category must be selected");
    });

    it("should catch typos in email addresses", () => {
      const typoForm = {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@gmail,com", // Comma instead of dot
        country: "USA",
        reason: "I need help with immigration",
        categories: ["O-1"],
      };

      const result = validator.validateForm(typoForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid email format");
    });

    it("should catch too brief explanations", () => {
      const briefForm = {
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike@example.com",
        country: "Australia",
        reason: "Help me", // Too short
        categories: ["O-1"],
      };

      const result = validator.validateForm(briefForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Reason must be between 10 and 1000 characters");
    });

    it("should catch invalid website URLs", () => {
      const invalidUrlForm = {
        firstName: "Lisa",
        lastName: "Wang",
        email: "lisa@example.com",
        country: "China",
        website: "not a website",
        reason: "I need immigration assistance for my application",
        categories: ["EB-2 NIW"],
      };

      const result = validator.validateForm(invalidUrlForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid website URL format");
    });
  });

  describe("Data Input Variations", () => {
    const validator = createCompleteValidationSuite();

    it("should handle form data with extra whitespace", () => {
      const whitespaceForm = {
        firstName: "  John  ",
        lastName: "  Doe  ",
        email: "  john.doe@example.com  ",
        country: "  United States  ",
        website: "  https://johndoe.com  ",
        reason: "  I need immigration assistance for my O-1 application.  ",
        categories: ["O-1"],
      };

      const result = validator.validateForm(whitespaceForm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle mixed case email addresses", () => {
      const mixedCaseForm = {
        firstName: "Emma",
        lastName: "Brown",
        email: "Emma.BROWN@Gmail.COM",
        country: "United States",
        reason: "I am seeking immigration assistance for my visa application",
        categories: ["EB-1A"],
      };

      const result = validator.validateForm(mixedCaseForm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle names with apostrophes and hyphens", () => {
      const specialNameForm = {
        firstName: "Mary-Jane",
        lastName: "O'Sullivan-Smith",
        email: "maryjane@example.com",
        country: "Ireland",
        reason: "I am seeking immigration assistance for my application process",
        categories: ["O-1"],
      };

      const result = validator.validateForm(specialNameForm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Security Scenario Testing", () => {
    const validator = createCompleteValidationSuite();

    it("should reject XSS attempts in form fields", () => {
      const xssForm = {
        firstName: '<script>alert("xss")</script>',
        lastName: "Smith",
        email: "test@example.com",
        country: "USA",
        reason: "Normal reason here",
        categories: ["O-1"],
      };

      const result = validator.validateForm(xssForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("First name contains invalid characters");
    });

    it("should reject SQL injection attempts", () => {
      const sqlInjectionForm = {
        firstName: "John",
        lastName: "'; DROP TABLE leads; --",
        email: "john@example.com",
        country: "USA",
        reason: "Need immigration help",
        categories: ["O-1"],
      };

      const result = validator.validateForm(sqlInjectionForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Last name contains invalid characters");
    });
  });

  describe("File Upload Scenarios", () => {
    const validateFileUpload = (file: { name: string; type: string; size: number }) => {
      const errors: string[] = [];
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (file.size > maxSize) {
        errors.push("File size must be less than 5MB");
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push("Only PDF, DOC, DOCX, and TXT files are allowed");
      }

      return { isValid: errors.length === 0, errors };
    };

    it("should accept valid resume files", () => {
      const validFiles = [
        { name: "resume.pdf", type: "application/pdf", size: 2 * 1024 * 1024 },
        { name: "cv.doc", type: "application/msword", size: 1 * 1024 * 1024 },
        {
          name: "resume.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 3 * 1024 * 1024,
        },
        { name: "resume.txt", type: "text/plain", size: 500 * 1024 },
      ];

      validFiles.forEach((file) => {
        const result = validateFileUpload(file);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should reject invalid file types", () => {
      const invalidFiles = [
        { name: "photo.jpg", type: "image/jpeg", size: 1 * 1024 * 1024 },
        {
          name: "document.zip",
          type: "application/zip",
          size: 2 * 1024 * 1024,
        },
        {
          name: "presentation.pptx",
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          size: 3 * 1024 * 1024,
        },
      ];

      invalidFiles.forEach((file) => {
        const result = validateFileUpload(file);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Only PDF, DOC, DOCX, and TXT files are allowed");
      });
    });

    it("should reject files that are too large", () => {
      const largeFile = {
        name: "large-resume.pdf",
        type: "application/pdf",
        size: 10 * 1024 * 1024,
      };

      const result = validateFileUpload(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("File size must be less than 5MB");
    });
  });

  describe("Performance and Load Testing Scenarios", () => {
    it("should handle rapid form validation calls", () => {
      const validator = createCompleteValidationSuite();
      const testForm = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        country: "USA",
        reason: "I need immigration assistance",
        categories: ["O-1"],
      };

      const startTime = performance.now();

      // Validate the same form 1000 times
      for (let i = 0; i < 1000; i++) {
        validator.validateForm(testForm);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete 1000 validations in under 100ms
      expect(totalTime).toBeLessThan(100);
    });

    it("should handle forms with maximum allowed content", () => {
      const validator = createCompleteValidationSuite();
      const maxContentForm = {
        firstName: "A".repeat(50), // Max length
        lastName: "B".repeat(50), // Max length
        email: "a".repeat(90) + "@test.com", // Max length
        country: "C".repeat(100), // Max length
        website: "https://" + "d".repeat(185) + ".com", // Max length
        reason: "E".repeat(1000), // Max length
        categories: ["O-1", "EB-1A", "EB-2 NIW"], // Multiple categories
      };

      const result = validator.validateForm(maxContentForm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
