// BarcodeComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Barcode, BarcodeFields } from "./BarcodeStore";

export const BarcodeComponents = MyGenericComponents(
  Barcode,
  BarcodeFields,
  getPathParts(import.meta.url, "Components")
);
