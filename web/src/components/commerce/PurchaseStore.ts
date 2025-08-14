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

export const PurchaseFields = {
  id: {
    field: "ID",
  },
  status: {
    field: "ChoiceIntegerField",
    choices: toOptions(STATUS_CHOICES),
    defaultValue: 0,
  },
  supplier: {
    field: "SetNullOptionalForeignKey",
    fk: "Supplier",
    appFK: "People",
  },
  purchaseItems: {
    field: "AnyListField",
    readOnly: true,
  },
  transactionItems: {
    field: "AnyListField",
    readOnly: true,
  },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(PurchaseFields);
export class Purchase extends MyModel(slug, props) {}
export class PurchaseStore extends MyStore(Purchase, BASE_URL, slug) {}
export type PurchaseInterface = PropsToInterface<typeof props>;
