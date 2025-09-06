import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { STATUS_CHOICES } from "./_AllChoices";

const { slug } = getPathParts("commerce", "SaleReceipt");

export const SaleReceiptFields = {
  id: {
    field: "ID",
  },
  sale: {
    field: "CascadeRequiredForeignKey",
    fk: "Sale",
  },
  image: {
    field: "ImageField",
  },
  pageNumber: {
    field: "LimitedIntegerField",
  },
  totalPages: {
    field: "LimitedIntegerField",
  },
  toPrint: {
    field: "DefaultBooleanField",
  },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(SaleReceiptFields);
export class SaleReceipt extends MyModel(slug, props) {}
export class SaleReceiptStore extends MyStore(SaleReceipt, BASE_URL, slug) {}
export type SaleReceiptInterface = PropsToInterface<typeof props>;
