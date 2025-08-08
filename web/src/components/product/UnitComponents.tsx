// UnitComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Unit, UnitFields } from "./UnitStore";

export const UnitComponents = MyGenericComponents(
  Unit,
  UnitFields,
  getPathParts(import.meta.url, "Components")
);
