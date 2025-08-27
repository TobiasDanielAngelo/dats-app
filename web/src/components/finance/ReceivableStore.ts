import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts("finance", "Receivable");

export const ReceivableFields = {
  id: { field: "ID" },
  charge: { field: "CascadeOptionalForeignKey", fk: "Transaction" },
  payments: { field: "OptionalManyToManyField", fk: "Transaction" },
  name: { field: "ShortCharField" },
  amount: { field: "AmountField" },
  description: { field: "MediumCharField" },
  dateDue: { field: "OptionalDateField" },
  dateCompleted: { field: "OptionalDateField", readOnly: true },
  paymentTotal: { field: "AmountField", readOnly: true },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(ReceivableFields);

export class Receivable extends MyModel(slug, props) {}
export class ReceivableStore extends MyStore(Receivable, BASE_URL, slug) {}
export type ReceivableInterface = PropsToInterface<typeof props>;
