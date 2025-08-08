import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Purchase, PurchaseFields } from "./PurchaseStore";

export const PurchaseComponents = MyGenericComponents(
  Purchase,
  PurchaseFields,
  getPathParts(import.meta.url, "Components")
);
