import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Sale, SaleFields } from "./SaleStore";

export const SaleComponents = MyGenericComponents(
  Sale,
  SaleFields,
  getPathParts(import.meta.url, "Components")
);
