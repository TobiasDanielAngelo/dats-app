import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { STATUS_CHOICES } from "./_AllChoices";

const { slug } = getPathParts("commerce", "Sale");

export const SaleFields = {
  id: {
    field: "ID",
  },
  status: {
    field: "ChoiceIntegerField",
    choices: toOptions(STATUS_CHOICES),
    defaultValue: 0,
  },
  customer: {
    field: "ShortCharField",
  },
  salesItems: {
    field: "AnyListField",
    readOnly: true,
  },
  tempSalesItems: {
    field: "AnyListField",
    readOnly: true,
  },
  laborItems: {
    field: "AnyListField",
    readOnly: true,
  },
  transactionItems: {
    field: "AnyListField",
    readOnly: true,
  },
  totalCost: {
    field: "AmountField",
    readOnly: true,
  },
  change: {
    field: "AmountField",
    readOnly: true,
  },
  amountPaid: {
    field: "AmountField",
    readOnly: true,
  },
  amountPayable: {
    field: "AmountField",
    readOnly: true,
  },
  currentStatus: {
    field: "MediumCharField",
    readOnly: true,
  },
  toPrint: {
    field: "DefaultBooleanField",
  },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(SaleFields);
export class Sale extends MyModel(slug, props) {}
export class SaleStore extends MyStore(Sale, BASE_URL, slug) {}
export type SaleInterface = PropsToInterface<typeof props>;
