import React from "react";
import {
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  uiTypeIs,
  LayoutProps,
} from "@jsonforms/core";
import { JsonFormsDispatch, withJsonFormsLayoutProps } from "@jsonforms/react";

const HorizontalLayoutRenderer = ({
  uischema,
  schema,
  path,
  enabled,
  renderers,
  cells,
}: LayoutProps) => {
  const layout = uischema as Layout;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      className="sm:flex-row sm:gap-0"
    >
      {layout.elements.map((element, index) => (
        <div
          key={index}
          style={{
            flex: "1",
            marginLeft: index > 0 ? "0" : "0",
          }}
          className={index > 0 ? "sm:ml-12" : ""}
        >
          <JsonFormsDispatch
            uischema={element}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        </div>
      ))}
    </div>
  );
};

const VerticalLayoutRenderer = ({
  uischema,
  schema,
  path,
  enabled,
  renderers,
  cells,
}: LayoutProps) => {
  const layout = uischema as Layout;

  return (
    <div className="space-y-4 sm:space-y-6">
      {layout.elements.map((element, index) => (
        <div key={index} className="w-full">
          <JsonFormsDispatch
            uischema={element}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        </div>
      ))}
    </div>
  );
};

export const horizontalLayoutTester = rankWith(
  100,
  (uischema, schema, context) => {
    return uischema.type === "HorizontalLayout";
  }
);
export const horizontalLayoutRenderer = withJsonFormsLayoutProps(
  HorizontalLayoutRenderer
);

export const verticalLayoutTester = rankWith(
  100,
  (uischema, schema, context) => {
    return uischema.type === "VerticalLayout";
  }
);
export const verticalLayoutRenderer = withJsonFormsLayoutProps(
  VerticalLayoutRenderer
);
