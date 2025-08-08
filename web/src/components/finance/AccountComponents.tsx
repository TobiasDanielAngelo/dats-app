// AccountComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Account, AccountFields } from "./AccountStore";

export const AccountComponents = MyGenericComponents(
  Account,
  AccountFields,
  getPathParts(import.meta.url, "Components")
);
