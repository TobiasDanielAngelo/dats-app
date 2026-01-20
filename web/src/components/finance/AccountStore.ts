import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { TYPE_CHOICES } from "./_AllChoices";

const { slug } = getPathParts("finance", "Account");

export const AccountFields = {
  id: { field: "ID" },
  name: { field: "ShortCharField" },
  type: { field: "ChoiceIntegerField", choices: toOptions(TYPE_CHOICES) },
  netBalanceDated: { field: "AmountField", readOnly: true },
  netBalancePostDated: { field: "AmountField", readOnly: true },
  daysTilZero: { field: "LongCharField", readOnly: true },
  worstAverageValue: { field: "AmountField", readOnly: true },
  worstPeakDay: { field: "LimitedIntegerField", readOnly: true },
} satisfies Record<string, DjangoModelField>;

export const AccountIdMap = {
  Initial: -1,
  Untracked: -2,
  Assets: -3,
  Liabilities: -4,
  Checking: -5,
  Mortgage: -6,
  Stocks: -7,
  "Cash Box": -8,
  "Coin Box": -9,
  "Cash Register": -10,
} as const;

const props = fieldToProps(AccountFields);

export class Account extends MyModel(slug, props) {}
export class AccountStore extends MyStore(Account, BASE_URL, slug) {}
export type AccountInterface = PropsToInterface<typeof props>;
