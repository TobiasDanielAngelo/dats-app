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

  const onPressCheckBox = () => {
    commerceStore.laborStore.updateItem(item.id, {
      isPaid: !item.isPaid,
    });
  };
  return [
    {
      icon: item.isPaid ? "CheckBox" : "CheckBoxOutlineBlank",
      name: "Labor",
      label: "Labor",
      onPress: onPressCheckBox,
    },
  ] satisfies ActionModalDef[];
};

export const LaborComponents = MyGenericComponents(
  Labor,
  LaborFields,
  getPathParts("commerce", "Labor"),
  { MoreModals }
);
