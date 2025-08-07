import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import { MyModel, MyStore } from "../core/_GenericStore";

export const { slug, titleCase } = getPathParts(import.meta.url, "Store");

const LOG_TYPE_CHOICES = [
  "Sale",
  "Purchase",
  "Return",
  "Adjustment",
  "Physical Count",
  "Transfer",
];

export const InventoryLogFields = {
  id: {
    field: "ID",
  },
  product: {
    field: "CascadeRequiredForeignKey",
    fk: "Product",
    choices: [],
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
    choices: [],
  },
  receiver: {
    field: "SetNullOptionalForeignKey",
    fk: "Location",
    choices: [],
  },
} satisfies Record<string, DjangoModelField>;
const props = fieldToProps(InventoryLogFields);

export class InventoryLog extends MyModel(slug, props) {}
export class InventoryLogStore extends MyStore(InventoryLog, BASE_URL, slug) {}
export type InventoryLogInterface = PropsToInterface<typeof props>;
