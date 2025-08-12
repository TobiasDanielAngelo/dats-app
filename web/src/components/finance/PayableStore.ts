import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const PayableFields = {
  id: { field: "ID" },
  charge: { field: "CascadeOptionalForeignKey", fk: "Transaction" },
  payments: { field: "OptionalManyToManyField", fk: "Transaction" },
  name: { field: "ShortCharField" },
  amount: { field: "AmountField" },
  description: { field: "MediumCharField" },
  dateDue: { field: "OptionalDateField" },
  dateCompleted: { field: "OptionalDateField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(PayableFields);

export class Payable extends MyModel(slug, props) {}
export class PayableStore extends MyStore(Payable, BASE_URL, slug) {}
export type PayableInterface = PropsToInterface<typeof props>;
