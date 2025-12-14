import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts("product", "PrintJob");

export const PrintJobFields = {
  id: { field: "ID" },
  product: { field: "CascadeOptionalForeignKey", fk: "Article" },
  description: { field: "LongCharField" },
  purchaseCode: { field: "ShortCharField" },
  sellingCode: { field: "ShortCharField" },
  fontSizes: { field: "NumberArrayField" },
  quantity: { field: "LimitedIntegerField" },
  dimension: { field: "SetNullOptionalForeignKey", fk: "PrintDimension" },
  isCompleted: { field: "DefaultBooleanField" },
  widthMm: { field: "LimitedIntegerField", readOnly: true },
  heightMm: { field: "LimitedIntegerField", readOnly: true },
  imgWidthMm: { field: "LimitedIntegerField" },
  isQ1NotQ3: { field: "DefaultBooleanField" },
  image: { field: "ImageField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(PrintJobFields);

export class PrintJob extends MyModel(slug, props) {}
export class PrintJobStore extends MyStore(PrintJob, BASE_URL, slug) {}
export type PrintJobInterface = PropsToInterface<typeof props>;
