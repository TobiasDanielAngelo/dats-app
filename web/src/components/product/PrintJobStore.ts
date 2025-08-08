import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const PrintJobFields = {
  id: { field: "ID" },
  product: { field: "CascadeRequiredForeignKey", fk: "Article" },
  quantity: { field: "LimitedIntegerField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(PrintJobFields);

export class PrintJob extends MyModel(slug, props) {}
export class PrintJobStore extends MyStore(PrintJob, BASE_URL, slug) {}
export type PrintJobInterface = PropsToInterface<typeof props>;
