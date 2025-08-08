// PayableComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Payable, PayableFields } from "./PayableStore";

export const PayableComponents = MyGenericComponents(
  Payable,
  PayableFields,
  getPathParts(import.meta.url, "Components")
);
