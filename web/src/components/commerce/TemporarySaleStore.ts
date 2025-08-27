import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts("commerce", "TemporarySale");

export const TemporarySaleFields = {
  id: { field: "ID" },
  product: { field: "MediumCharField" },
  unit: { field: "SetNullOptionalForeignKey", appFK: "Product", fk: "Unit" },
  quantity: { field: "LimitedDecimalField" },
  unitAmount: { field: "AmountField" },
  subtotalAmount: { field: "AmountField", readOnly: true },
  sale: { field: "CascadeRequiredForeignKey", fk: "Sale" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(TemporarySaleFields);

export class TemporarySale extends MyModel(slug, props) {}
export class TemporarySaleStore extends MyStore(
  TemporarySale,
  BASE_URL,
  slug
) {}
export type TemporarySaleInterface = PropsToInterface<typeof props>;
