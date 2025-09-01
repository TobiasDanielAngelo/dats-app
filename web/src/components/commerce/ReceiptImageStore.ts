import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts("commerce", "ReceiptImage");

export const ReceiptImageFields = {
  id: {
    field: "ID",
  },
  image: {
    field: "ImageField",
  },
  receiptNo: {
    field: "ShortCharField",
    searchable: true,
  },
  issuer: {
    field: "ShortCharField",
    searchable: true,
  },
  date: {
    field: "OptionalDateField",
  },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(ReceiptImageFields);
export class ReceiptImage extends MyModel(slug, props) {}
export class ReceiptImageStore extends MyStore(ReceiptImage, BASE_URL, slug) {}
export type ReceiptImageInterface = PropsToInterface<typeof props>;
