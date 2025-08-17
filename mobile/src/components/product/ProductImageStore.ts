import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts("product", "ProductImage");

export const ProductImageFields = {
  id: { field: "ID" },
  part: { field: "CascadeRequiredForeignKey", fk: "Article" },
  image: { field: "ImageField" },
  altText: { field: "ShortCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(ProductImageFields);

export class ProductImage extends MyModel(slug, props) {}
export class ProductImageStore extends MyStore(ProductImage, BASE_URL, slug) {}
export type ProductImageInterface = PropsToInterface<typeof props>;
