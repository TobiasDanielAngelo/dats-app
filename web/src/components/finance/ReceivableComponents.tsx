// ReceivableComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Receivable, ReceivableFields } from "./ReceivableStore";

export const ReceivableComponents = MyGenericComponents(
  Receivable,
  ReceivableFields,
  getPathParts(import.meta.url, "Components")
);
