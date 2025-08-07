import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import { MyModel, MyStore } from "../core/_GenericStore";

export const { slug, titleCase } = getPathParts(import.meta.url, "Store");

export const STATUS_CHOICES = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Fulfilled",
  "Cancelled",
];

export const SaleFields = {
  id: {
    field: "ID",
  },
  status: {
    field: "ChoiceIntegerField",
    choices: toOptions(STATUS_CHOICES),
  },
  transactions: {
    field: "OptionalManyToManyField",
    fk: "Transaction",
  },
  inventory_logs: {
    field: "OptionalManyToManyField",
    fk: "Sale",
  },
  customer: {
    field: "SetNullOptionalForeignKey",
    fk: "Customer",
  },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(SaleFields);
export class Sale extends MyModel(slug, props) {}
export class SaleStore extends MyStore(Sale, BASE_URL, slug) {}
export type SaleInterface = PropsToInterface<typeof props>;
