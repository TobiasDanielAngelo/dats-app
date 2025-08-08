import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const ReceivableFields = {
  id: { field: "ID" },
  charge: { field: "CascadeOptionalForeignKey", fk: "Transaction" },
  payments: { field: "OptionalManyToManyField", fk: "Transaction" },
  name: { field: "ShortCharField" },
  amount: { field: "AmountField" },
  description: { field: "MediumCharField" },
  date_due: { field: "OptionalDateField" },
  date_completed: { field: "OptionalDateField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(ReceivableFields);

export class Receivable extends MyModel(slug, props) {}
export class ReceivableStore extends MyStore(Receivable, BASE_URL, slug) {}
export type ReceivableInterface = PropsToInterface<typeof props>;
