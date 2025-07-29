import { JsonSchema } from "@jsonforms/core";

export const leadFormSchema: JsonSchema = {
  type: "object",
  properties: {
    firstName: {
      type: "string",
      title: "First Name",
      minLength: 2,
      maxLength: 50,
      pattern: "^[a-zA-Z\\s'-]+$",
    },
    lastName: {
      type: "string",
      title: "Last Name",
      minLength: 2,
      maxLength: 50,
      pattern: "^[a-zA-Z\\s'-]+$",
    },
    email: {
      type: "string",
      format: "email",
      title: "Email",
      minLength: 5,
      maxLength: 100,
    },
    country: {
      type: "string",
      title: "Country of Citizenship",
      minLength: 2,
      maxLength: 100,
    },
    website: {
      type: "string",
      title: "LinkedIn / Personal Website URL",
      format: "uri",
      minLength: 5,
      maxLength: 200,
    },
    resume: {
      type: "string",
      title: "Upload your resume",
    },
    diceIcon: {
      type: "null",
      title: "Dice Icon",
    },
    categories: {
      type: "array",
      title: "Visa categories of interest?",
      items: {
        type: "string",
        enum: ["O-1", "EB-1A", "EB-2 NIW", "I don't know"],
      },
      uniqueItems: true,
      minItems: 1,
    },
    heartIcon: {
      type: "null",
      title: "Heart Icon",
    },
    helpText: {
      type: "null",
      title: "How can we help you?",
    },
    reason: {
      type: "string",
      title: "How can we help you?",
      minLength: 10,
      maxLength: 2000,
    },
  },
  required: [
    "firstName",
    "lastName",
    "email",
    "country",
    "categories",
    "reason",
  ],
};
