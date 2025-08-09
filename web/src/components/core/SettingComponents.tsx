// LaborTypeComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { DjangoModelField } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { Setting } from "./SettingStore";

export const SettingFields = {
  id: {
    field: "ID",
  },
  key: {
    field: "ShortCharField",
  },
  value: {
    field: "LongCharField",
  },
  description: {
    field: "MediumCharField",
  },
} satisfies Record<string, DjangoModelField>;

export const SettingComponents = MyGenericComponents(
  Setting,
  SettingFields,
  getPathParts(import.meta.url, "Components")
);
