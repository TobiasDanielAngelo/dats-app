import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { ActionModalDef } from "../../constants/interfaces";
import { Store } from "../core/Store";
import { InventoryLog, InventoryLogFields } from "./InventoryLogStore";

type MoreInventoryLogInterface = {};

const MoreModals = (
  item: InventoryLog,
  context: {
    value: MoreInventoryLogInterface;
    setValue: (t: MoreInventoryLogInterface) => void;
  },
  store?: Store
) => {
  context;
  if (!store) return [];
  const { commerceStore } = store;

  const onClickCheckBox = () => {
    commerceStore.inventoryLogStore.updateItem(item.id, {
      isCollected: !item.isCollected,
    });
  };
  return [
    {
      icon: item.isCollected ? "CheckBox" : "CheckBoxOutlineBlank",
      name: "status",
      label: "Status",
      onClick: onClickCheckBox,
    },
  ] satisfies ActionModalDef[];
};

export const InventoryLogComponents = MyGenericComponents(
  InventoryLog,
  InventoryLogFields,
  getPathParts("commerce", "InventoryLog"),
  <></>,
  [],
  MoreModals
);
