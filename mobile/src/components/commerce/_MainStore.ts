import { model, Model } from "mobx-keystone";
import { storesToProps } from "../../blueprints/MyGenericComponents/MyGenericStore";
import { InventoryLogStore } from "./InventoryLogStore";
import { LaborStore } from "./LaborStore";
import { LaborTypeStore } from "./LaborTypeStore";
import { PrintJobStore } from "./PrintJobStore";
import { PurchaseStore } from "./PurchaseStore";
import { SaleStore } from "./SaleStore";
import { TemporaryPurchaseStore } from "./TemporaryPurchaseStore";
import { TemporarySaleStore } from "./TemporarySaleStore";

@model("myApp/CommerceStore")
export class CommerceStore extends Model(
  storesToProps({
    InventoryLogStore,
    LaborStore,
    PrintJobStore,
    LaborTypeStore,
    PurchaseStore,
    SaleStore,
    TemporaryPurchaseStore,
    TemporarySaleStore,
  })
) {}
