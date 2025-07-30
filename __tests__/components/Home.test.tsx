import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import Home from "@/app/page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock JsonForms
jest.mock("@jsonforms/react", () => ({
  JsonForms: ({ onChange, data }: any) => {
    // Don't use useEffect to avoid infinite loops
    return (
      <div data-testid="json-forms">
        <input
          data-testid="firstName"
          value={data.firstName || ""}
          onChange={(e) =>
            onChange({
              data: { ...data, firstName: e.target.value },
              errors: [],
            })
          }
        />
        <input
          data-testid="lastName"
          value={data.lastName || ""}
          onChange={(e) =>
            onChange({
              data: { ...data, lastName: e.target.value },
              errors: [],
            })
          }
        />
        <input
          data-testid="email"
          value={data.email || ""}
          onChange={(e) => onChange({ data: { ...data, email: e.target.value }, errors: [] })}
        />
        <input
          data-testid="country"
          value={data.country || ""}
          onChange={(e) => onChange({ data: { ...data, country: e.target.value }, errors: [] })}
        />
        <input
          data-testid="website"
          value={data.website || ""}
          onChange={(e) => onChange({ data: { ...data, website: e.target.value }, errors: [] })}
        />
        <textarea
          data-testid="reason"
          value={data.reason || ""}
          onChange={(e) => onChange({ data: { ...data, reason: e.target.value }, errors: [] })}
        />
        <input
          data-testid="categories"
          type="checkbox"
          value="O-1"
          checked={data.categories?.includes("O-1") || false}
          onChange={(e) => {
            const categories = data.categories || [];
            const newCategories = e.target.checked
              ? [...categories, "O-1"]
              : categories.filter((c: string) => c !== "O-1");
            onChange({
              data: { ...data, categories: newCategories },
              errors: [],
            });
          }}
        />
        <input
          data-testid="resume"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onChange({ data: { ...data, resume: file }, errors: [] });
          }}
        />
      </div>
    );
  },
}));

// Mock vanilla renderers
jest.mock("@jsonforms/vanilla-renderers", () => ({
  vanillaCells: [],
}));

// Mock ValidationProvider
jest.mock("@/lib/forms/ValidationContext", () => ({
  ValidationProvider: ({ children }: any) => children,
}));

// Mock form schemas
jest.mock("@/lib/forms", () => ({
  leadFormSchema: {},
  leadFormSchemaLenient: {},
  leadFormUISchema: {},
  textInputControlTester: jest.fn(),
  textInputControl: jest.fn(),
  textAreaControlTester: jest.fn(),
  textAreaControl: jest.fn(),
  fileUploadControlTester: jest.fn(),
  fileUploadControl: jest.fn(),
  iconControlTester: jest.fn(),
  iconControl: jest.fn(),
  headingControlTester: jest.fn(),
  headingControl: jest.fn(),
  checkboxArrayControlTester: jest.fn(),
  checkboxArrayControl: jest.fn(),
  horizontalLayoutTester: jest.fn(),
  horizontalLayoutRenderer: jest.fn(),
  verticalLayoutTester: jest.fn(),
  verticalLayoutRenderer: jest.fn(),
}));

jest.mock("@/lib/forms/leadFormSchemaLenient", () => ({
  leadFormSchemaLenient: {},
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn();

describe("Home Component - Form Submission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
  });

  const fillFormData = async (user: any, overrides: any = {}) => {
    const defaultData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      country: "United States",
      website: "https://johndoe.com",
      reason: "I am seeking immigration assistance for my O-1 visa application.",
      ...overrides,
    };

    // Fill form fields
    if (defaultData.firstName) {
      await user.type(screen.getByTestId("firstName"), defaultData.firstName);
    }
    if (defaultData.lastName) {
      await user.type(screen.getByTestId("lastName"), defaultData.lastName);
    }
    if (defaultData.email) {
      await user.type(screen.getByTestId("email"), defaultData.email);
    }
    if (defaultData.country) {
      await user.type(screen.getByTestId("country"), defaultData.country);
    }
    if (defaultData.website) {
      await user.type(screen.getByTestId("website"), defaultData.website);
    }
    if (defaultData.reason) {
      await user.type(screen.getByTestId("reason"), defaultData.reason);
    }

    // Select category
    await user.click(screen.getByTestId("categories"));
  };

  describe("Successful Submissions", () => {
    it("should successfully submit form with valid data", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Lead submitted successfully",
          id: 1,
        }),
      });

      render(<Home />);

      // Fill form
      await fillFormData(user);

      // Submit form
      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/leads", {
          method: "POST",
          body: expect.any(FormData),
        });
      });

      // Should redirect to thank you page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/thank-you");
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValue(fetchPromise);

      render(<Home />);

      // Fill form
      await fillFormData(user);

      // Submit form
      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/submitting/i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });

      // Resolve the fetch promise
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true }),
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/thank-you");
      });
    });

    it("should submit form with file upload", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<Home />);

      // Fill form
      await fillFormData(user);

      // Add file
      const file = new File(["resume content"], "resume.pdf", {
        type: "application/pdf",
      });
      const fileInput = screen.getByTestId("resume");
      await user.upload(fileInput, file);

      // Submit form
      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        expect(options.body).toBeInstanceOf(FormData);
      });
    });
  });

  describe("Validation Edge Cases", () => {
    it("should show validation errors for empty form", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      // Should not call fetch for invalid form
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should validate email format", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await fillFormData(user, { email: "invalid-email" });

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      // Should not submit with invalid email
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should validate minimum reason length", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await fillFormData(user, { reason: "Short" });

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      // Should not submit with short reason
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should validate name format", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await fillFormData(user, { firstName: "John123", lastName: "Doe@#$" });

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      // Should not submit with invalid names
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should validate website URL format", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await fillFormData(user, { website: "not-a-url" });

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      // Should not submit with invalid website
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("Server Error Handling", () => {
    it("should handle validation errors from server", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: "Validation failed",
          details: ["Invalid category selected", "Email format is invalid"],
        }),
      });

      render(<Home />);

      await fillFormData(user);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please fix the following:/)).toBeInTheDocument();
        expect(screen.getByText(/Invalid category selected/)).toBeInTheDocument();
      });
    });

    it("should handle rate limiting error", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: "Too many requests",
        }),
      });

      render(<Home />);

      await fillFormData(user);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Too many submissions. Please wait before trying again./)
        ).toBeInTheDocument();
      });
    });

    it("should handle server errors gracefully", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: "Internal server error",
        }),
      });

      render(<Home />);

      await fillFormData(user);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Internal server error/)).toBeInTheDocument();
      });
    });

    it("should handle network errors", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      render(<Home />);

      await fillFormData(user);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
      });
    });

    it("should handle malformed JSON response", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      render(<Home />);

      await fillFormData(user);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to submit form. Please try again./)).toBeInTheDocument();
      });
    });
  });

  describe("Form State Management", () => {
    it("should clear submit error when retrying", async () => {
      const user = userEvent.setup();

      // First request fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      });

      render(<Home />);

      await fillFormData(user);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/Server error/)).toBeInTheDocument();
      });

      // Second request succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await user.click(submitButton);

      // Error should be cleared and redirect should happen
      await waitFor(() => {
        expect(screen.queryByText(/Server error/)).not.toBeInTheDocument();
        expect(mockPush).toHaveBeenCalledWith("/thank-you");
      });
    });

    it("should maintain form data during submission errors", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      });

      render(<Home />);

      await fillFormData(user);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Server error/)).toBeInTheDocument();
      });

      // Form data should still be there
      expect(screen.getByTestId("firstName")).toHaveValue("John");
      expect(screen.getByTestId("lastName")).toHaveValue("Doe");
      expect(screen.getByTestId("email")).toHaveValue("john.doe@example.com");
    });

    it("should handle rapid successive submissions", async () => {
      const user = userEvent.setup();
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              }),
            100
          )
        );
      });

      render(<Home />);

      await fillFormData(user);

      const submitButtons = screen.getAllByRole("button", { name: /submit/i });
      const submitButton = submitButtons[submitButtons.length - 1]; // Get the main form button

      // Try to submit multiple times quickly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/thank-you");
      });

      // Should only make one API call due to loading state
      expect(callCount).toBe(1);
    });
  });
});
