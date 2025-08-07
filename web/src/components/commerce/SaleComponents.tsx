import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Sale, SaleFields } from "./SaleStore";

export const {
  Form: SaleForm,
  Filter: SaleFilter,
  Table: SaleTable,
  Collection: SaleCollection,
  View: SaleView,
} = MyGenericComponents(
  Sale,
  SaleFields,
  getPathParts(import.meta.url, "Components")
);
