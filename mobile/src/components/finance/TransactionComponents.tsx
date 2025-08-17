// TransactionComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Transaction, TransactionFields } from "./TransactionStore";

const pathParts = getPathParts("finance", "Transaction");

export const TransactionComponents = MyGenericComponents(
  Transaction,
  TransactionFields,
  pathParts
);
