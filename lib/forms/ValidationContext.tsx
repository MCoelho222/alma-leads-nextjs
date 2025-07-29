import React, { createContext, useContext } from "react";

interface ValidationContextType {
  fieldErrors: Record<string, string>;
  hasAttemptedSubmit: boolean;
}

const ValidationContext = createContext<ValidationContextType>({
  fieldErrors: {},
  hasAttemptedSubmit: false,
});

export const useValidation = () => useContext(ValidationContext);

export const ValidationProvider: React.FC<{
  children: React.ReactNode;
  fieldErrors: Record<string, string>;
  hasAttemptedSubmit: boolean;
}> = ({ children, fieldErrors, hasAttemptedSubmit }) => {
  return (
    <ValidationContext.Provider value={{ fieldErrors, hasAttemptedSubmit }}>
      {children}
    </ValidationContext.Provider>
  );
};
