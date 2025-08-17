// CustomerComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Customer, CustomerFields } from "./CustomerStore";

export const CustomerComponents = MyGenericComponents(
  Customer,
  CustomerFields,
  getPathParts("people", "Customer")
);
