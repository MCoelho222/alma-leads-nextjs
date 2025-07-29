import { JsonSchema } from "@jsonforms/core";

export const leadFormSchemaLenient: JsonSchema = {
  type: "object",
  properties: {
    firstName: {
      type: "string",
      title: "First Name",
    },
    lastName: {
      type: "string",
      title: "Last Name",
    },
    email: {
      type: "string",
      title: "Email",
    },
    country: {
      type: "string",
      title: "Country of Citizenship",
    },
    website: {
      type: "string",
      title: "LinkedIn / Personal Website URL",
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
    },
  },
  required: [],
};
