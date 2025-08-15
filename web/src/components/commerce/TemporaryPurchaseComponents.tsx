// TemporaryPurchaseComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import {
  TemporaryPurchase,
  TemporaryPurchaseFields,
} from "./TemporaryPurchaseStore";

export const TemporaryPurchaseComponents = MyGenericComponents(
  TemporaryPurchase,
  TemporaryPurchaseFields,
  getPathParts(import.meta.url, "Components")
);
