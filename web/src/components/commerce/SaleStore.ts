import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { STATUS_CHOICES } from "./_AllChoices";

const { slug } = getPathParts(import.meta.url, "Store");

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
