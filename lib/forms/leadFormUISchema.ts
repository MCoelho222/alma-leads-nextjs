import { UISchemaElement } from "@jsonforms/core";

export const leadFormUISchema: UISchemaElement = {
  type: "VerticalLayout",
  elements: [
    {
      type: "HorizontalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/firstName",
          options: {
            placeholder: "First Name",
          },
        },
        {
          type: "Control",
          scope: "#/properties/lastName",
          options: {
            placeholder: "Last Name",
          },
        },
      ],
    },
    {
      type: "Control",
      scope: "#/properties/email",
      options: {
        placeholder: "Email",
      },
    },
    {
      type: "Control",
      scope: "#/properties/country",
      options: {
        placeholder: "Country of Citizenship",
      },
    },
    {
      type: "Control",
      scope: "#/properties/website",
      options: {
        placeholder: "LinkedIn / Personal Website URL",
      },
    },
    {
      type: "Control",
      scope: "#/properties/resume",
      options: {
        format: "file",
      },
    },
    {
      type: "Control",
      scope: "#/properties/diceIcon",
      options: {
        format: "icon",
        iconSrc: "/icons/dice-icon.png",
        iconAlt: "Dice icon",
      },
    },
    {
      type: "Control",
      scope: "#/properties/categories",
      options: {
        format: "checkbox",
      },
    },
    {
      type: "Control",
      scope: "#/properties/heartIcon",
      options: {
        format: "icon",
        iconSrc: "/icons/heart-icon.png",
        iconAlt: "Heart icon",
      },
    },
    {
      type: "Control",
      scope: "#/properties/helpText",
      options: {
        format: "heading",
        text: "How can we help you?",
      },
    },
    {
      type: "Control",
      scope: "#/properties/reason",
      options: {
        multi: true,
        placeholder:
          "What is your current status and when does it expire?\nWhat is your past immigration history? Are you looking for long-term permanent residency or short-term employment visa or both? Are there any timeline considerations?",
      },
    },
  ],
};
