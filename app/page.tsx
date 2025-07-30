"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JsonForms } from "@jsonforms/react";
import { vanillaCells } from "@jsonforms/vanilla-renderers";
import {
  leadFormSchema,
  leadFormUISchema,
  textInputControlTester,
  textInputControl,
  textAreaControlTester,
  textAreaControl,
  fileUploadControlTester,
  fileUploadControl,
  iconControlTester,
  iconControl,
  headingControlTester,
  headingControl,
  checkboxArrayControlTester,
  checkboxArrayControl,
  horizontalLayoutTester,
  horizontalLayoutRenderer,
  verticalLayoutTester,
  verticalLayoutRenderer,
} from "@/lib/forms";
import { leadFormSchemaLenient } from "@/lib/forms/leadFormSchemaLenient";
import { ValidationProvider } from "@/lib/forms/ValidationContext";

export default function Home() {
  const router = useRouter();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    website: string;
    categories: string[];
    reason: string;
    resume?: File | null;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    website: "",
    categories: [],
    reason: "",
    resume: null,
  });

  // Custom renderers for JsonForms
  const renderers = [
    { tester: horizontalLayoutTester, renderer: horizontalLayoutRenderer },
    { tester: verticalLayoutTester, renderer: verticalLayoutRenderer },
    { tester: textAreaControlTester, renderer: textAreaControl },
    { tester: textInputControlTester, renderer: textInputControl },
    { tester: fileUploadControlTester, renderer: fileUploadControl },
    { tester: iconControlTester, renderer: iconControl },
    { tester: headingControlTester, renderer: headingControl },
    { tester: checkboxArrayControlTester, renderer: checkboxArrayControl },
  ];

  // Custom validation for field-level error display
  const validateFormFields = (data: any) => {
    const errors: Record<string, string> = {};

    // First name validation
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName)) {
      errors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Last name validation
    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName)) {
      errors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Email validation
    if (!data.email || data.email.trim().length < 5) {
      errors.email = "Email must be at least 5 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Country validation
    if (!data.country || data.country.trim().length < 2) {
      errors.country = "Country is required";
    }

    // Website validation (optional but must be valid URL if provided)
    if (data.website && data.website.trim().length > 0) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      const simpleUrlPattern =
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(\/.*)?$/;

      if (!urlPattern.test(data.website.trim()) && !simpleUrlPattern.test(data.website.trim())) {
        errors.website =
          "Please enter a valid URL (e.g., https://example.com or www.linkedin.com/in/yourname)";
      }
    }

    // Categories validation
    if (!data.categories || data.categories.length === 0) {
      errors.categories = "Please select at least one visa category";
    }

    // Reason validation
    if (!data.reason || data.reason.trim().length < 10) {
      errors.reason = "Please provide at least 10 characters explaining your reason";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasAttemptedSubmit) {
      setHasAttemptedSubmit(true);

      // Validate form data
      const errors = validateFormFields(formData);
      setFieldErrors(errors);

      if (Object.keys(errors).length === 0) {
        submitForm();
      }
      return;
    }

    // If already attempted submit, re-validate and proceed if valid
    const errors = validateFormFields(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      submitForm();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "resume" && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item) => formDataToSend.append(key, item));
        } else if (typeof value === "string") {
          formDataToSend.append(key, value);
        }
      });

      const res = await fetch("/api/leads", {
        method: "POST",
        body: formDataToSend,
      });

      if (res.ok) {
        router.push("/thank-you");
      } else {
        // Handle different types of errors
        const errorData = await res.json().catch(() => null);

        if (res.status === 429) {
          setSubmitError("Too many submissions. Please wait before trying again.");
        } else if (res.status === 400 && errorData?.details) {
          // Handle validation errors
          const errors = Array.isArray(errorData.details)
            ? errorData.details.join(", ")
            : errorData.error;
          setSubmitError(`Please fix the following: ${errors}`);
        } else {
          setSubmitError(errorData?.error || "Failed to submit form. Please try again.");
        }
      }
    } catch (error) {
      // Handle network errors (server not running, connection issues, etc.)
      setSubmitError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-white font-sans min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-0 pb-0">
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] overflow-hidden mb-4 sm:mb-6">
          <Image
            src="/images/banner.png"
            alt="Immigration case assessment banner"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 768px, 768px"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
        <Image
          src="/icons/file-icon.png"
          alt="Info document"
          width={64}
          height={64}
          className="mx-auto mb-3 sm:mb-4"
        />
        <h2 className="text-lg sm:text-xl font-bold text-center mb-5">
          Want to understand your visa options?
        </h2>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-[calc(100vw-2rem)] sm:w-[calc(768px-3rem)] max-w-none">
            <p className="text-center font-bold text-xs sm:text-sm px-4">
              Submit the form below and our team of experienced attorneys will review your
              information and send a preliminary assessment of your case based on your goals.
            </p>
          </div>
          <div className="h-12 sm:h-16"></div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <ValidationProvider fieldErrors={fieldErrors} hasAttemptedSubmit={hasAttemptedSubmit}>
            <JsonForms
              key={hasAttemptedSubmit ? "validation" : "lenient"}
              schema={hasAttemptedSubmit ? leadFormSchema : leadFormSchemaLenient}
              uischema={leadFormUISchema}
              data={formData}
              renderers={renderers}
              cells={vanillaCells}
              onChange={({ data, errors }) => {
                setFormData(data);
                setValidationErrors(errors || []);
              }}
              validationMode="ValidateAndShow"
            />
          </ValidationProvider>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white w-full py-2 sm:py-3 rounded font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
