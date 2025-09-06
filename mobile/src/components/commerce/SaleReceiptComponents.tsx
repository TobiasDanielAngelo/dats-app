// SaleReceiptComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { SaleReceipt, SaleReceiptFields } from "./SaleReceiptStore";

export const SaleReceiptComponents = MyGenericComponents(
  SaleReceipt,
  SaleReceiptFields,
  getPathParts("commerce", "SaleReceipt")
);
