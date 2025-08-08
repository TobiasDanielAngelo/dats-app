// SupplierComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Supplier, SupplierFields } from "./SupplierStore";

export const SupplierComponents = MyGenericComponents(
  Supplier,
  SupplierFields,
  getPathParts(import.meta.url, "Components")
);
