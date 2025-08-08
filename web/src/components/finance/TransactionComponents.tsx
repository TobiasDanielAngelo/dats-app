// TransactionComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Transaction, TransactionFields } from "./TransactionStore";

export const TransactionComponents = MyGenericComponents(
  Transaction,
  TransactionFields,
  getPathParts(import.meta.url, "Components")
);
