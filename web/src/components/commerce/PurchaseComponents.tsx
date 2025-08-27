import { observer } from "mobx-react-lite";
import { useContext, useEffect } from "react";
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { IconName, MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { getPathParts } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef } from "../../constants/interfaces";
import { Store, useStore } from "../core/Store";
import { Finance } from "../finance/_AllComponents";
import { AccountIdMap } from "../finance/AccountStore";
import { CategoryIdMap } from "../finance/CategoryStore";
import { LocationIdMap } from "../product/LocationStore";
import { LOG_TYPE_CHOICES } from "./_AllChoices";
import { Commerce } from "./_AllComponents";
import { Purchase, PurchaseFields } from "./PurchaseStore";

interface ActionIconsProps {
  theItem: Purchase;
  handlers: {
    onAddPurchases: () => void;
    onAddTempPurchases: () => void;
    onAddPayment: () => void;
  };
}

const ActionIcons = ({ theItem, handlers }: ActionIconsProps) => {
  const iconConfig = [
    { icon: "Inbox", label: "Add Purchases", onClick: handlers.onAddPurchases },
    {
      icon: "Inbox",
      label: "Add Temp. Purchases",
      onClick: handlers.onAddTempPurchases,
    },

    { icon: "Payment", label: "Add Payment", onClick: handlers.onAddPayment },
  ];

  return (
    <div
      className="absolute flex flex-row gap-3"
      style={{ top: 10, right: 10 }}
    >
      {iconConfig.map(({ icon, label, onClick }) => (
        <MyIcon
          key={label}
          icon={icon as IconName}
          label={label}
          fontSize="large"
          onClick={onClick}
          hidden={!theItem}
        />
      ))}
    </div>
  );
};

const useFetchItemData = (theItem: Purchase | undefined, stores: Store) => {
  const { commerceStore, financeStore } = stores;

  useEffect(() => {
    if (theItem?.purchaseItems.length) {
      commerceStore.inventoryLogStore.fetchAll(
        `id__in=${theItem.purchaseItems.join(",")}`
      );
    }
  }, [theItem?.purchaseItems.length, commerceStore.purchaseStore.lastUpdated]);

  useEffect(() => {
    if (theItem?.tempPurchaseItems.length) {
      commerceStore.temporaryPurchaseStore.fetchAll(
        `page=1&id__in=${theItem.tempPurchaseItems.join(",")}`
      );
    }
  }, [
    theItem?.tempPurchaseItems.length,
    commerceStore.purchaseStore.lastUpdated,
  ]);

  useEffect(() => {
    if (theItem?.transactionItems.length) {
      financeStore.transactionStore.fetchAll(
        `page=1&id__in=${theItem.transactionItems.join(",")}`
      );
    }
  }, [
    theItem?.transactionItems.length,
    commerceStore.purchaseStore.lastUpdated,
  ]);
};

interface ItemsFormProps {
  item?: Purchase;
  setVisible?: (t: boolean) => void;
}

const ItemsForm = observer(({ item }: ItemsFormProps) => {
  const store = useStore();
  const { commerceStore, financeStore } = store;
  const context = useContext(PurchaseComponents.MoreContext);

  const {
    isVisible1,
    setVisible1,
    isVisible3,
    setVisible3,
    isVisible2,
    setVisible2,
  } = useVisible();

  const currentItem = context.value
    ? commerceStore.purchaseStore.allItems.get(context.value.itemId)
    : undefined;

  const theItem = currentItem ?? item;

  useFetchItemData(theItem, store);

  const purchaseItems = commerceStore.inventoryLogStore.items.filter((s) =>
    theItem?.purchaseItems.includes(s.id as number)
  );

  const tempPurchaseItems = commerceStore.temporaryPurchaseStore.items.filter(
    (s) => theItem?.tempPurchaseItems.includes(s.id as number)
  );

  const transactionItems = financeStore.transactionStore.items.filter((s) =>
    theItem?.transactionItems.includes(s.id as number)
  );

  const actionHandlers = {
    onAddPurchases: () => setVisible1(true),
    onAddTempPurchases: () => setVisible2(true),
    onAddPayment: () => setVisible3(true),
  };

  if (!theItem) return <></>;

  return (
    <div className="dark:text-white text-teal-700 relative">
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <Commerce.InventoryLog.Form
          item={{
            purchase: theItem.id as number,
            logType: LOG_TYPE_CHOICES.findIndex((t) => t === "Purchase"),
            goingTo: LocationIdMap["Gen Luna Main"],
          }}
          setVisible={setVisible1}
          hiddenFields={["logType", "purchase", "sale", "comingFrom"]}
          fetchFcn={commerceStore.purchaseStore.fetchUpdated}
        />
      </MyModal>

      <MyModal isVisible={isVisible2} setVisible={setVisible2}>
        <Commerce.TemporaryPurchase.Form
          item={{ purchase: theItem.id as number }}
          setVisible={setVisible2}
          fetchFcn={commerceStore.purchaseStore.fetchUpdated}
          hiddenFields={["purchase"]}
        />
      </MyModal>

      <MyModal isVisible={isVisible3} setVisible={setVisible3}>
        <Finance.Transaction.Form
          item={{
            purchase: theItem.id as number,
            goingTo: AccountIdMap["Stocks"],
            category: CategoryIdMap["Supplies"],
            description: `Payment for C#${theItem.id}`,
          }}
          setVisible={setVisible3}
          fetchFcn={commerceStore.purchaseStore.fetchUpdated}
          hiddenFields={[
            "sale",
            "purchase",
            "labor",
            "goingTo",
            "description",
            "category",
          ]}
        />
      </MyModal>

      <div className="p-4">{theItem.displayName}</div>

      <Commerce.InventoryLog.Table
        items={purchaseItems}
        shownFields={[
          "displayName",
          "quantity",
          "unitAmount",
          "subtotalAmount",
          "isCollected",
        ]}
      />

      <Commerce.TemporaryPurchase.Table
        items={tempPurchaseItems}
        shownFields={[
          "displayName",
          "quantity",
          "unitAmount",
          "subtotalAmount",
        ]}
      />

      <Finance.Transaction.Table
        items={transactionItems}
        shownFields={["description", "amount"]}
      />

      <ActionIcons theItem={theItem} handlers={actionHandlers} />
    </div>
  );
});

const SideB = <ItemsForm />;

type MorePurchaseInterface = {
  itemId: number | string;
};

const MoreModals = (
  item: Purchase,
  context: {
    value: MorePurchaseInterface;
    setValue: (t: MorePurchaseInterface) => void;
  }
) => {
  const { value, setValue } = context;
  return [
    {
      icon: "RemoveRedEye",
      name: "Purchases",
      label: "Purchases",
      modal: ItemsForm,
      onClick: () => setValue({ ...value, itemId: item.id }),
    },
  ] satisfies ActionModalDef[];
};

const MainModals = [] satisfies ActionModalDef[];

export const PurchaseComponents = MyGenericComponents(
  Purchase,
  PurchaseFields,
  getPathParts("commerce", "Purchase"),
  SideB,
  MainModals,
  MoreModals
);
