// TransactionComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Transaction, TransactionFields } from "./TransactionStore";

const pathParts = getPathParts(import.meta.url, "Components");

export const TransactionComponents = MyGenericComponents(
  Transaction,
  TransactionFields,
  pathParts
);
