import React from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { ControlProps } from "@jsonforms/core";

interface FileUploadControlProps extends ControlProps {
  data: File | null;
  handleChange(path: string, value: any): void;
  path: string;
}

const FileUploadControl = ({
  data,
  handleChange,
  path,
  visible,
  enabled,
}: FileUploadControlProps) => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    handleChange(path, selectedFile);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="mb-4">
      <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
        Upload your resume
      </label>
      <input
        id="resume"
        type="file"
        accept=".pdf,.doc,.docx"
        disabled={!enabled}
        className="input file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
        onChange={onChange}
      />
    </div>
  );
};

export default withJsonFormsControlProps(FileUploadControl);
