import React from "react";
import Image from "next/image";
import {
  rankWith,
  isStringControl,
  isMultiLineControl,
  and,
  or,
  ControlProps,
  schemaMatches,
  optionIs,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { useValidation } from "./ValidationContext";

// Text Input Control
const TextInputControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  enabled,
}: ControlProps) => {
  const { fieldErrors, hasAttemptedSubmit } = useValidation();
  const placeholder = uischema?.options?.placeholder || schema.title || "";
  const isRequired = schema.minLength === 1 || (schema as any).required;
  const fieldId = path.replace(/\./g, "-");

  // Use custom validation errors when attempted submit
  const fieldError = hasAttemptedSubmit ? fieldErrors[path] : "";
  const hasErrors = !!fieldError;

  return (
    <div className="w-full">
      <input
        id={fieldId}
        name={fieldId}
        type={schema.format === "email" ? "email" : "text"}
        value={data || ""}
        placeholder={placeholder}
        required={isRequired}
        disabled={!enabled}
        className={`input ${
          hasErrors ? "input-error-explicit border-red-500" : ""
        }`}
        onChange={(event) => handleChange(path, event.target.value)}
      />
      {hasErrors && (
        <div className="validation-error-explicit text-red-600 font-medium text-xs mt-1">
          <div>{fieldError}</div>
        </div>
      )}
    </div>
  );
};

// Textarea Control
const TextAreaControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  enabled,
}: ControlProps) => {
  const { fieldErrors, hasAttemptedSubmit } = useValidation();
  const placeholder = uischema?.options?.placeholder || "";
  const isRequired = schema.minLength === 1;
  const fieldId = path.replace(/\./g, "-");

  // Use custom validation errors when attempted submit
  const fieldError = hasAttemptedSubmit ? fieldErrors[path] : "";
  const hasErrors = !!fieldError;

  return (
    <div className="w-full">
      <textarea
        id={fieldId}
        name={fieldId}
        value={data || ""}
        placeholder={placeholder}
        required={isRequired}
        disabled={!enabled}
        className={`w-full border border-gray-300 rounded px-3 py-2 resize-y text-sm ${
          hasErrors ? "input-error-explicit border-red-500" : ""
        }`}
        style={{ minHeight: "120px" }}
        onChange={(event) => handleChange(path, event.target.value)}
      />
      {hasErrors && (
        <div className="validation-error-explicit text-red-600 font-medium text-xs mt-1">
          <div>{fieldError}</div>
        </div>
      )}
    </div>
  );
};

// File Upload Control
const FileUploadControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  enabled,
}: ControlProps) => {
  const fieldId = path.replace(/\./g, "-");

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Upload your resume
      </label>
      <input
        id={fieldId}
        name={fieldId}
        type="file"
        accept=".pdf,.doc,.docx"
        disabled={!enabled}
        className="input file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          handleChange(path, file);
        }}
      />
    </div>
  );
};

// Icon Control
const IconControl = ({ uischema }: ControlProps) => {
  const iconSrc = uischema?.options?.iconSrc;
  const iconAlt = uischema?.options?.iconAlt || "Icon";

  if (!iconSrc) return null;

  return (
    <Image
      src={iconSrc}
      alt={iconAlt}
      width={64}
      height={64}
      className="mx-auto mb-3 sm:mb-4"
    />
  );
};

// Heading Control
const HeadingControl = ({ uischema }: ControlProps) => {
  const text = uischema?.options?.text || "";

  return (
    <div className="text-center">
      <h2 className="text-lg sm:text-xl font-bold">{text}</h2>
    </div>
  );
};

// Checkbox Array Control for visa categories
const CheckboxArrayControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  enabled,
}: ControlProps) => {
  const { fieldErrors, hasAttemptedSubmit } = useValidation();
  const items = schema.items as any;
  const options = items?.enum || [];
  const currentValues = data || [];
  const fieldId = path.replace(/\./g, "-");

  // Use custom validation errors when attempted submit
  const fieldError = hasAttemptedSubmit ? fieldErrors[path] : "";
  const hasErrors = !!fieldError;

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value);
    handleChange(path, newValues);
  };

  return (
    <fieldset>
      <legend className="text-lg sm:text-xl font-bold mb-4 text-center">
        {schema.title}
      </legend>
      <div>
        {options.map((option: string, index: number) => (
          <label
            key={option}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <input
              id={`${fieldId}-${index}`}
              name={fieldId}
              type="checkbox"
              value={option}
              checked={currentValues.includes(option)}
              disabled={!enabled}
              onChange={(e) => handleCheckboxChange(option, e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <span className="text-sm sm:text-base">{option}</span>
          </label>
        ))}
      </div>
      {hasErrors && (
        <div className="validation-error-explicit text-red-600 font-medium text-xs text-center mt-2">
          <div>{fieldError}</div>
        </div>
      )}
    </fieldset>
  );
};

// Create wrapped controls
export const textInputControlTester = rankWith(3, isStringControl);
export const textInputControl = withJsonFormsControlProps(TextInputControl);

export const textAreaControlTester = rankWith(
  10,
  (uischema, schema, context) => {
    return (
      isStringControl(uischema, schema, context) &&
      (isMultiLineControl(uischema, schema, context) ||
        (uischema?.options as any)?.multi === true)
    );
  }
);
export const textAreaControl = withJsonFormsControlProps(TextAreaControl);

export const fileUploadControlTester = rankWith(
  5,
  and(isStringControl, optionIs("format", "file"))
);
export const fileUploadControl = withJsonFormsControlProps(FileUploadControl);

export const iconControlTester = rankWith(
  6,
  and(
    schemaMatches((schema) => schema.type === "null"),
    optionIs("format", "icon")
  )
);
export const iconControl = withJsonFormsControlProps(IconControl);

export const headingControlTester = rankWith(
  6,
  and(
    schemaMatches((schema) => schema.type === "null"),
    optionIs("format", "heading")
  )
);
export const headingControl = withJsonFormsControlProps(HeadingControl);

export const checkboxArrayControlTester = rankWith(
  5,
  and(
    schemaMatches((schema) => schema.type === "array"),
    schemaMatches((schema) => {
      const items = schema.items as any;
      return items?.enum !== undefined;
    })
  )
);
export const checkboxArrayControl =
  withJsonFormsControlProps(CheckboxArrayControl);
