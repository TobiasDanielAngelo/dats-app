import { InventoryLogComponents } from "./InventoryLogComponents";
import { LaborComponents } from "./LaborComponents";
import { LaborTypeComponents } from "./LaborTypeComponents";
import { PrintJobComponents } from "./PrintJobComponents";
import { PurchaseComponents } from "./PurchaseComponents";
import { SaleComponents } from "./SaleComponents";
import { SaleReceiptComponents } from "./SaleReceiptComponents";
import { TemporaryPurchaseComponents } from "./TemporaryPurchaseComponents";
import { TemporarySaleComponents } from "./TemporarySaleComponents";

export const Commerce = {
  Sale: SaleComponents,
  Purchase: PurchaseComponents,
  InventoryLog: InventoryLogComponents,
  SaleReceipt: SaleReceiptComponents,
  Labor: LaborComponents,
  PrintJob: PrintJobComponents,
  LaborType: LaborTypeComponents,
  TemporaryPurchase: TemporaryPurchaseComponents,
  TemporarySale: TemporarySaleComponents,
};
