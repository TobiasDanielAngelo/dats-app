// ReceiptImageComponents.tsx
import { useContext } from "react";
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { ActionModalDef } from "../../constants/interfaces";
import { ReceiptImage, ReceiptImageFields } from "./ReceiptImageStore";
import { observer } from "mobx-react-lite";
import { useStore } from "../core/Store";

const ReceiptImageView = observer(() => {
  const { value } = useContext(ReceiptImageComponents.MoreContext);
  const { commerceStore } = useStore();

  const image = commerceStore.receiptImageStore.allItems.get(value.itemId);
  return image?.image ? <img src={image.image} /> : <></>;
});

type MoreReceiptImageInterface = {
  itemId: number | string;
};

const MoreModals = (
  item: ReceiptImage,
  context: {
    value: MoreReceiptImageInterface;
    setValue: (t: MoreReceiptImageInterface) => void;
  }
) => {
  const { value, setValue } = context;
  return [
    {
      icon: "RemoveRedEye",
      name: "Purchases",
      label: "Purchases",
      onClick: () => setValue({ ...value, itemId: item.id }),
    },
  ] satisfies ActionModalDef[];
};

export const ReceiptImageComponents = MyGenericComponents(
  ReceiptImage,
  ReceiptImageFields,
  getPathParts("commerce", "ReceiptImage"),
  <ReceiptImageView />,
  undefined,
  MoreModals
);
