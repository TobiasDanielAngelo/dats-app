import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { NATURE_CHOICES } from "./_AllChoices";

const { slug } = getPathParts(import.meta.url, "Store");

export const CategoryFields = {
  id: { field: "ID" },
  title: { field: "ShortCharField" },
  nature: { field: "ChoiceIntegerField", choices: toOptions(NATURE_CHOICES) },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(CategoryFields);

export class Category extends MyModel(slug, props) {}
export class CategoryStore extends MyStore(Category, BASE_URL, slug) {}
export type CategoryInterface = PropsToInterface<typeof props>;
