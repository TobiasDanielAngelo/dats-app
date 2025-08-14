// LaborComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { ActionModalDef, StateSetter } from "../../constants/interfaces";
import { Store } from "../core/Store";
import { Labor, LaborFields } from "./LaborStore";

type MoreLaborInterface = {
  isVisible: boolean;
  setVisible: StateSetter<boolean>;
};

const MoreModals = (
  item: Labor,
  context: {
    value: MoreLaborInterface;
    setValue: (t: MoreLaborInterface) => void;
  },
  store?: Store
) => {
  context;
  if (!store) return [];
  const { commerceStore } = store;

  const onClickCheckBox = () => {
    commerceStore.laborStore.updateItem(item.id, {
      isPaid: !item.isPaid,
    });
  };
  return [
    {
      icon: item.isPaid ? "CheckBox" : "CheckBoxOutlineBlank",
      name: "Labor",
      label: "Labor",
      onClick: onClickCheckBox,
    },
  ] satisfies ActionModalDef[];
};

export const LaborComponents = MyGenericComponents(
  Labor,
  LaborFields,
  getPathParts(import.meta.url, "Components"),
  <></>,
  [],
  MoreModals
);
