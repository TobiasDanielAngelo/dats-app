import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const MakerFields = {
  id: { field: "ID" },
  name: { field: "ShortCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(MakerFields);

export class Maker extends MyModel(slug, props) {}
export class MakerStore extends MyStore(Maker, BASE_URL, slug) {}
export type MakerInterface = PropsToInterface<typeof props>;
