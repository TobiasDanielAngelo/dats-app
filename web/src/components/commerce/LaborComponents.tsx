// LaborComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Labor, LaborFields } from "./LaborStore";

export const LaborComponents = MyGenericComponents(
  Labor,
  LaborFields,
  getPathParts(import.meta.url, "Components")
);
