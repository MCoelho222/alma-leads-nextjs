"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JsonForms } from "@jsonforms/react";
import { vanillaRenderers, vanillaCells } from "@jsonforms/vanilla-renderers";
import { createAjv } from "@jsonforms/core";
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
    ...vanillaRenderers,
  ];

  // Custom validation for field-level error display
  const validateFormFields = (data: any) => {
    const errors: Record<string, string> = {};

    // First name validation
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName)) {
      errors.firstName =
        "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Last name validation
    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName)) {
      errors.lastName =
        "Last name can only contain letters, spaces, hyphens, and apostrophes";
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
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      const simpleUrlPattern =
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(\/.*)?$/;

      if (
        !urlPattern.test(data.website.trim()) &&
        !simpleUrlPattern.test(data.website.trim())
      ) {
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
      errors.reason =
        "Please provide at least 10 characters explaining your reason";
    }

    return errors;
  };

  // Validation function
  const validateForm = () => {
    const errors = [];

    // Required field validation
    if (!formData.firstName?.trim()) errors.push("First Name is required");
    if (!formData.lastName?.trim()) errors.push("Last Name is required");
    if (!formData.email?.trim()) errors.push("Email is required");
    if (!formData.country?.trim()) errors.push("Country is required");
    if (!formData.reason?.trim()) errors.push("Reason is required");
    if (!formData.categories?.length)
      errors.push("At least one visa category is required");

    // Length validation
    if (formData.firstName && formData.firstName.length < 2)
      errors.push("First Name must be at least 2 characters");
    if (formData.lastName && formData.lastName.length < 2)
      errors.push("Last Name must be at least 2 characters");
    if (formData.reason && formData.reason.length < 10)
      errors.push("Reason must be at least 10 characters");

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    // Name pattern validation
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (formData.firstName && !nameRegex.test(formData.firstName)) {
      errors.push(
        "First Name can only contain letters, spaces, hyphens, and apostrophes"
      );
    }
    if (formData.lastName && !nameRegex.test(formData.lastName)) {
      errors.push(
        "Last Name can only contain letters, spaces, hyphens, and apostrophes"
      );
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔴 SUBMIT CLICKED - hasAttemptedSubmit:", hasAttemptedSubmit);
    console.log("🔴 SUBMIT CLICKED - formData:", formData);

    if (!hasAttemptedSubmit) {
      console.log("🔴 First submit attempt - validating fields");
      setHasAttemptedSubmit(true);

      // Validate form data
      const errors = validateFormFields(formData);
      console.log("🔴 Validation errors:", errors);
      setFieldErrors(errors);

      if (Object.keys(errors).length === 0) {
        console.log(
          "🔴 No validation errors found, proceeding with submission"
        );
        submitForm();
      } else {
        console.log("🔴 Validation errors found, staying on form");
      }
      return;
    }

    // If already attempted submit, re-validate and proceed if valid
    const errors = validateFormFields(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      console.log("🔴 Form is valid, submitting");
      submitForm();
    } else {
      console.log("🔴 Form still has validation errors:", errors);
    }
  };

  const submitForm = async () => {
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

    if (res.ok) router.push("/thank-you");
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
        <h2 className="text-lg sm:text-xl font-bold text-center">
          Want to understand your visa options?
        </h2>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-[calc(100vw-2rem)] sm:w-[calc(768px-3rem)] max-w-none">
            <p className="text-center font-bold text-xs sm:text-sm px-4">
              Submit the form below and our team of experienced attorneys will
              review your information and send a preliminary assessment of your
              case based on your goals.
            </p>
          </div>
          <div className="h-12 sm:h-16"></div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <ValidationProvider
            fieldErrors={fieldErrors}
            hasAttemptedSubmit={hasAttemptedSubmit}
          >
            <JsonForms
              key={hasAttemptedSubmit ? "validation" : "lenient"}
              schema={
                hasAttemptedSubmit ? leadFormSchema : leadFormSchemaLenient
              }
              uischema={leadFormUISchema}
              data={formData}
              renderers={renderers}
              cells={vanillaCells}
              onChange={({ data, errors }) => {
                console.log(
                  "JsonForms onChange - data:",
                  data,
                  "errors:",
                  errors
                );
                setFormData(data);
                setValidationErrors(errors || []);
              }}
              validationMode="ValidateAndShow"
            />
          </ValidationProvider>

          <button
            type="submit"
            className="bg-black text-white w-full py-2 sm:py-3 rounded font-semibold text-sm sm:text-base"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
