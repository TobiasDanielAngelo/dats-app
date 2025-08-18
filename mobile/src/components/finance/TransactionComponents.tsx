import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { TransactionQuickView } from "./MoreTransactionComponents";
import { Transaction, TransactionFields } from "./TransactionStore";

const pathParts = getPathParts("finance", "Transaction");

const MoreViews = () => [
  { icon: "bolt", view: <TransactionQuickView />, name: "quick" },
];

export const TransactionComponents = MyGenericComponents(
  Transaction,
  TransactionFields,
  pathParts,
  {
    MoreViews,
    availableViews: ["quick"],
    hiddenSpeedDials: ["Toggle Graphs", "Show Fields"],
  }
);
