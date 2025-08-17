import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const TemporaryPurchaseFields = {
  id: { field: "ID" },
  product: { field: "MediumCharField" },
  unit: { field: "SetNullOptionalForeignKey", fk: "Unit", appFK: "Product" },
  quantity: { field: "LimitedDecimalField" },
  unitAmount: { field: "AmountField" },
  subtotalAmount: { field: "AmountField", readOnly: true },
  purchase: { field: "CascadeRequiredForeignKey", fk: "Purchase" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(TemporaryPurchaseFields);

export class TemporaryPurchase extends MyModel(slug, props) {}
export class TemporaryPurchaseStore extends MyStore(
  TemporaryPurchase,
  BASE_URL,
  slug
) {}
export type TemporaryPurchaseInterface = PropsToInterface<typeof props>;
