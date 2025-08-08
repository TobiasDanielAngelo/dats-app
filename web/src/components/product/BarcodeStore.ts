import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const BarcodeFields = {
  id: { field: "ID" },
  product: { field: "OneToOneField" },
  code: { field: "ShortCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(BarcodeFields);

export class Barcode extends MyModel(slug, props) {}
export class BarcodeStore extends MyStore(Barcode, BASE_URL, slug) {}
export type BarcodeInterface = PropsToInterface<typeof props>;
