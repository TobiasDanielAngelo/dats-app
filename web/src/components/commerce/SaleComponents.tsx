import { observer } from "mobx-react-lite";
import { useContext, useEffect, useState } from "react";
import { MyButton, MyConfirmModal, MyInput } from "../../blueprints";
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { getPathParts } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef } from "../../constants/interfaces";
import { useStore } from "../core/Store";
import { Commerce } from "./_AllComponents";
import { InventoryLog } from "./InventoryLogStore";
import { Sale, SaleFields } from "./SaleStore";
import { LOG_TYPE_CHOICES } from "./_AllChoices";

const SalesItemsForm = observer(
  (props: { item?: Sale; setVisible?: (t: boolean) => void }) => {
    const { item } = props;
    const { commerceStore } = useStore();

    const context = useContext(SaleComponents.MoreContext);

    const { isVisible1, setVisible1 } = useVisible();
    const currentItem = context.value
      ? commerceStore.saleStore.allItems.get(context.value.itemId)
      : undefined;

    const theItem = currentItem ?? item;

    const salesItems = commerceStore.inventoryLogStore.items.filter(
      (s) => s.sale === theItem?.id
    );

    console.log(salesItems.length);

    const Row = (props: { item: InventoryLog }) => {
      const { item } = props;
      const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
      const [amt, setAmt] = useState(item.quantity.toString());
      return (
        <div className="flex flex-row">
          <MyConfirmModal
            isVisible={isVisible2}
            setVisible={setVisible2}
            onClickCheck={() =>
              commerceStore.inventoryLogStore.deleteItem(item.id)
            }
            objectName={"Sale Item"}
            actionName="Delete"
          />
          <MyModal isVisible={isVisible1} setVisible={setVisible1}>
            <div className="flex flex-row justify-center items-center">
              <MyInput
                type="number"
                onChangeValue={setAmt}
                value={amt}
                noCalc
              />
              <MyIcon
                icon="Check"
                onClick={() => {
                  commerceStore.inventoryLogStore.updateItem(item.id, {
                    quantity: parseFloat(amt),
                  });
                  setVisible1(false);
                  commerceStore.saleStore.fetchUpdated();
                }}
              />
            </div>
          </MyModal>
          <MyIcon icon="Edit" onClick={() => setVisible1(true)} />
          <MyIcon icon="Close" onClick={() => setVisible2(true)} />
        </div>
      );
    };

    useEffect(() => {
      if (theItem) {
        commerceStore.inventoryLogStore.fetchAll(
          `page=1&id__in=${theItem?.salesItems.join(",")}`
        );
        commerceStore.saleStore.fetchUpdated();
      }
    }, [theItem?.salesItems.length, salesItems.length]);

    return (
      <div className="dark:text-white text-teal-700 relative">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Commerce.InventoryLog.Form
            item={{
              sale: (theItem?.id ?? -1) as number,
              logType: LOG_TYPE_CHOICES.findIndex((t) => t === "Sale"),
            }}
            setVisible={setVisible1}
            hiddenFields={[
              "logType",
              "purchase",
              "sale",
              "transmitter",
              "receiver",
            ]}
          />
        </MyModal>
        <div className="p-4">{theItem?.displayName}</div>
        <div className="h-[70vh]">
          <Commerce.InventoryLog.Table
            items={salesItems}
            shownFields={[
              "displayName",
              "quantity",
              "unitAmount",
              "subtotalAmount",
            ]}
            renderActions={(item) => <Row item={item} />}
          />
        </div>
        <MyButton
          hidden={!theItem}
          disabled={!theItem}
          onClick={() => theItem && setVisible1(true)}
          label={"Add a Sales Item"}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: !theItem ? "gray" : undefined,
          }}
        />
      </div>
    );
  }
);

const SideB = <SalesItemsForm />;

type MoreSaleInterface = {
  itemId: number | string;
};

const MoreModals = (
  item: Sale,
  context: {
    value: MoreSaleInterface;
    setValue: (t: MoreSaleInterface) => void;
  }
) => {
  const { value, setValue } = context;
  return [
    {
      icon: "RemoveRedEye",
      name: "Sales",
      label: "Sales",
      modal: SalesItemsForm,
      onClick: () => setValue({ ...value, itemId: item.id }),
    },
  ] satisfies ActionModalDef[];
};

export const SaleComponents = MyGenericComponents(
  Sale,
  SaleFields,
  getPathParts(import.meta.url, "Components"),
  SideB,
  MoreModals
);
