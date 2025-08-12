import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { LOG_TYPE_CHOICES } from "./_AllChoices";

const { slug } = getPathParts(import.meta.url, "Store");

export const InventoryLogFields = {
  id: {
    field: "ID",
  },
  product: {
    field: "CascadeRequiredForeignKey",
    fk: "Article",
    appFK: "Product",
  },
  quantity: {
    field: "LimitedIntegerField",
  },
  logType: {
    field: "ChoiceIntegerField",
    choices: toOptions(LOG_TYPE_CHOICES),
    defaultValue: 0,
  },
  transmitter: {
    field: "SetNullOptionalForeignKey",
    fk: "Location",
    appFK: "Product",
  },
  receiver: {
    field: "SetNullOptionalForeignKey",
    fk: "Location",
    appFK: "Product",
  },
  purchase: {
    field: "CascadeOptionalForeignKey",
    fk: "Purchase",
  },
  sale: {
    field: "CascadeOptionalForeignKey",
    fk: "Sale",
  },
  unitAmount: {
    field: "AmountField",
    readOnly: true,
  },
  subtotalAmount: {
    field: "AmountField",
    readOnly: true,
  },
} satisfies Record<string, DjangoModelField>;
const props = fieldToProps(InventoryLogFields);

export class InventoryLog extends MyModel(slug, props) {}
export class InventoryLogStore extends MyStore(InventoryLog, BASE_URL, slug) {}
export type InventoryLogInterface = PropsToInterface<typeof props>;
