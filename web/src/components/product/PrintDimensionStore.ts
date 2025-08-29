import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts("product", "PrintDimension");

export const PrintDimensionIdMap = {
  Quantum: -1,
};
export const PrintDimensionFields = {
  id: { field: "ID" },
  widthMm: { field: "LimitedIntegerField" },
  heightMm: { field: "LimitedIntegerField" },
  name: { field: "ShortCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(PrintDimensionFields);

export class PrintDimension extends MyModel(slug, props) {}
export class PrintDimensionStore extends MyStore(
  PrintDimension,
  BASE_URL,
  slug
) {}
export type PrintDimensionInterface = PropsToInterface<typeof props>;
