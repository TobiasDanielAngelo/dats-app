import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts("finance", "Transaction");

export const TransactionFields = {
  id: { field: "ID" },
  category: {
    field: "SetNullOptionalForeignKey",
    fk: "Category",
  },
  description: { field: "MediumCharField" },
  comingFrom: {
    field: "SetNullOptionalForeignKey",
    fk: "Account",
  },
  goingTo: {
    field: "SetNullOptionalForeignKey",
    fk: "Account",
  },
  purchase: {
    field: "CascadeOptionalForeignKey",
    fk: "Purchase",
    appFK: "Commerce",
  },
  sale: {
    field: "CascadeOptionalForeignKey",
    fk: "Sale",
    appFK: "Commerce",
  },
  labor: {
    field: "CascadeOptionalForeignKey",
    fk: "Labor",
    appFK: "Commerce",
  },
  amount: { field: "AmountField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(TransactionFields);

export class Transaction extends MyModel(slug, props) {}
export class TransactionStore extends MyStore(Transaction, BASE_URL, slug) {}
export type TransactionInterface = PropsToInterface<typeof props>;
