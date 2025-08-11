import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { TYPE_CHOICES } from "./_AllChoices";

const { slug } = getPathParts(import.meta.url, "Store");

export const AccountFields = {
  id: { field: "ID" },
  name: { field: "ShortCharField" },
  type: { field: "ChoiceIntegerField", choices: toOptions(TYPE_CHOICES) },
  netBalance: { field: "AmountField", readOnly: true },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(AccountFields);

export class Account extends MyModel(slug, props) {}
export class AccountStore extends MyStore(Account, BASE_URL, slug) {}
export type AccountInterface = PropsToInterface<typeof props>;
