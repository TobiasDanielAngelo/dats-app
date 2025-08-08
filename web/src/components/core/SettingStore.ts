import { modelAction, modelFlow, prop } from "mobx-keystone";
import { BASE_URL } from "../../constants/constants";
import { PropsToInterface } from "../../constants/interfaces";
import {
  functionBinder,
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

export const SettingIdMap = {
  Theme: 1000001,
  UGW: 1000002,
  GW4: 1000003,
  GW3: 1000004,
  GW2: 1000005,
  GW1: 1000006,
} as const;

const slug = "settings/";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  key: prop<string>(""),
  value: prop<string>(""),
  description: prop<string>(""),
};

export type SettingInterface = PropsToInterface<typeof props>;
export class Setting extends MyModel(slug, props) {}
export class SettingStore extends MyStore(Setting, BASE_URL, slug) {
  constructor(args: any) {
    super(args);
    functionBinder(this);
  }

  @modelAction
  theme = function (this: SettingStore) {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const defaultTheme = prefersDark ? "dark" : "light";
    return (
      this.allItems.get(SettingIdMap.Theme)?.value ?? savedTheme ?? defaultTheme
    );
  };
  @modelFlow
  toggleTheme = async function (this: SettingStore) {
    const currentTheme = this.allItems.get(SettingIdMap.Theme)?.value;
    if (currentTheme) {
      const newTheme = currentTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      this.updateItem(SettingIdMap.Theme, { value: newTheme });
    }
  };
}
