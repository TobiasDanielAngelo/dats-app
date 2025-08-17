import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { NATURE_CHOICES } from "./_AllChoices";

export const CategoryIdMap = {
  Food: -1,
  Utilities: -2,
  Rent: -3,
  Salaries: -4,
  Supplies: -5,
  Transportation: -6,
  "Repairs & Maintenance": -7,
  Marketing: -8,
  Taxes: -9,
  Miscellaneous: -10,
  "Product Sales": -11,
  "Service Income": -12,
  "Rental Income": -13,
  "Interest Income": -14,
  "Other Income": -15,
  "Bank Transfer": -16,
  "Cash to Bank": -17,
  "Bank to Cash": -18,
  "Inter-branch Transfer": -19,
  "Customer Credit": -20,
  "Loan to Employee": -21,
  "Advance Payment from Customer": -22,
  "Supplier Invoice": -23,
  "Loan Payable": -24,
  Tax: -25,
};

const { slug } = getPathParts("finance", "Category");

export const CategoryFields = {
  id: { field: "ID" },
  title: { field: "ShortCharField" },
  nature: { field: "ChoiceIntegerField", choices: toOptions(NATURE_CHOICES) },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(CategoryFields);

export class Category extends MyModel(slug, props) {}
export class CategoryStore extends MyStore(Category, BASE_URL, slug) {}
export type CategoryInterface = PropsToInterface<typeof props>;
