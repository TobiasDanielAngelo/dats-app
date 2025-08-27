// LaborTypeComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { LaborType, LaborTypeFields } from "./LaborTypeStore";

export const LaborTypeComponents = MyGenericComponents(
  LaborType,
  LaborTypeFields,
  getPathParts("commerce", "LaborType")
);
