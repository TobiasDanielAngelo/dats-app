import { model, Model } from "mobx-keystone";
import { storesToProps } from "../../blueprints/MyGenericComponents/MyGenericStore";
import { AccountStore } from "./AccountStore";
import { CategoryStore } from "./CategoryStore";
import { PayableStore } from "./PayableStore";
import { ReceivableStore } from "./ReceivableStore";
import { TransactionStore } from "./TransactionStore";

@model("myApp/FinanceStore")
export class FinanceStore extends Model(
  storesToProps({
    AccountStore,
    CategoryStore,
    PayableStore,
    ReceivableStore,
    TransactionStore,
  })
) {}
