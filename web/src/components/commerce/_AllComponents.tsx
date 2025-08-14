import { InventoryLogComponents } from "./InventoryLogComponents";
import { LaborComponents } from "./LaborComponents";
import { LaborTypeComponents } from "./LaborTypeComponents";
import { PrintJobComponents } from "./PrintJobComponents";
import { PurchaseComponents } from "./PurchaseComponents";
import { SaleComponents } from "./SaleComponents";

export const Commerce = {
  Sale: SaleComponents,
  Purchase: PurchaseComponents,
  InventoryLog: InventoryLogComponents,
  Labor: LaborComponents,
  PrintJob: PrintJobComponents,
  LaborType: LaborTypeComponents,
};
