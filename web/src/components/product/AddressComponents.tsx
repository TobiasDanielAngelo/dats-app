// AddressComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Address, AddressFields } from "./AddressStore";

export const AddressComponents = MyGenericComponents(
  Address,
  AddressFields,
  getPathParts("product", "Address")
);
