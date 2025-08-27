import { observer } from "mobx-react-lite";
import { useContext, useEffect } from "react";
import { MyConfirmModal } from "../../blueprints";
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { IconName, MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { getPathParts, toMoney } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef } from "../../constants/interfaces";
import { Store, useStore } from "../core/Store";
import { Finance } from "../finance/_AllComponents";
import { AccountIdMap } from "../finance/AccountStore";
import { CategoryIdMap } from "../finance/CategoryStore";
import { LocationIdMap } from "../product/LocationStore";
import { LOG_TYPE_CHOICES } from "./_AllChoices";
import { Commerce } from "./_AllComponents";
import { Sale, SaleFields } from "./SaleStore";
import moment from "moment";

interface ActionIconsProps {
  theItem: Sale;
  handlers: {
    onAddSales: () => void;
    onAddTempSales: () => void;
    onAddLabor: () => void;
    onAddPayment: () => void;
    onAddChange: () => void;
    onAddLoan: () => void;
  };
}

const ActionIcons = ({ theItem, handlers }: ActionIconsProps) => {
  const iconConfig = [
    { icon: "Inbox", label: "Add Sales", onClick: handlers.onAddSales },
    {
      icon: "Inbox",
      label: "Add Temp. Sales",
      onClick: handlers.onAddTempSales,
    },
    {
      icon: "PrecisionManufacturing",
      label: "Add Labor",
      onClick: handlers.onAddLabor,
    },
    {
      icon: "Payment",
      label: "Add Payment",
      onClick: handlers.onAddPayment,
      hidden: theItem.amountPayable <= 0,
    },
    {
      icon: "Toll",
      label: "Change",
      onClick: handlers.onAddChange,
      hidden: theItem.change <= 0,
    },
    {
      icon: "Payment",
      label: "Promissory",
      onClick: handlers.onAddLoan,
      hidden: theItem.amountPayable <= 0,
    },
  ];

  return (
    <div
      className="absolute flex flex-row gap-3"
      style={{ top: 10, right: 10 }}
    >
      {iconConfig.map(({ icon, label, onClick, hidden }) => (
        <MyIcon
          key={label}
          icon={icon as IconName}
          label={label}
          fontSize="large"
          onClick={onClick}
          hidden={!theItem || hidden}
        />
      ))}
    </div>
  );
};

const useFetchItemData = (theItem: Sale | undefined, stores: Store) => {
  const { commerceStore, financeStore } = stores;

  function useFetchOnChange(
    items: number[] | undefined,
    fetch: { fetchAll: (query: string) => void }
  ) {
    useEffect(() => {
      if (items?.length) {
        fetch.fetchAll(`page=1&id__in=${items.join(",")}`);
      }
    }, [items?.length, commerceStore.saleStore.lastUpdated]);
  }

  useFetchOnChange(theItem?.laborItems, commerceStore.laborStore);
  useFetchOnChange(theItem?.salesItems, commerceStore.inventoryLogStore);
  useFetchOnChange(theItem?.tempSalesItems, commerceStore.temporarySaleStore);
  useFetchOnChange(theItem?.transactionItems, financeStore.transactionStore);
};

interface ItemsFormProps {
  item?: Sale;
  setVisible?: (t: boolean) => void;
}

const ItemsForm = observer(({ item }: ItemsFormProps) => {
  const store = useStore();
  const { commerceStore, financeStore } = store;
  const context = useContext(SaleComponents.MoreContext);

  const {
    isVisible1,
    setVisible1,
    isVisible2,
    setVisible2,
    isVisible3,
    setVisible3,
    isVisible4,
    setVisible4,
    isVisible5,
    setVisible5,
    isVisible6,
    setVisible6,
  } = useVisible();

  const currentItem = context.value
    ? commerceStore.saleStore.allItems.get(context.value.itemId)
    : undefined;

  const theItem = currentItem ?? item;

  useFetchItemData(theItem, store);

  const salesItems = commerceStore.inventoryLogStore.items.filter((s) =>
    theItem?.salesItems.includes(s.id as number)
  );

  const tempSalesItems = commerceStore.temporarySaleStore.items.filter((s) =>
    theItem?.tempSalesItems.includes(s.id as number)
  );

  const laborItems = commerceStore.laborStore.items.filter((s) =>
    theItem?.laborItems.includes(s.id as number)
  );

  const transactionItems = financeStore.transactionStore.items.filter((s) =>
    theItem?.transactionItems.includes(s.id as number)
  );

  const handleDispenseChange = () => {
    financeStore.transactionStore.addItem({
      sale: theItem!.id as number,
      comingFrom: AccountIdMap["Stocks"],
      goingTo: AccountIdMap["Cash Register"],
      category: CategoryIdMap["Product Sales"],
      description: `Change for C#${theItem!.id}`,
      amount: -theItem!.change,
    });
    setVisible4(false);
    commerceStore.saleStore.fetchUpdated();
  };

  const handleAddLoan = async () => {
    try {
      const resp = await financeStore.transactionStore.addItem({
        sale: theItem!.id as number,
        comingFrom: AccountIdMap["Stocks"],
        category: CategoryIdMap["Product Sales"],
        description: `Promissory Payment for C#${theItem!.id}`,
        amount: theItem?.amountPayable,
      });
      if (!resp.data) return;
      financeStore.receivableStore.addItem({
        charge: resp.data.id as number,
        amount: theItem?.amountPayable,
        dateDue: moment(new Date()).add(1, "month").format("YYYY-MM-DD"),
        name: item?.customer,
      });
    } catch (e) {
      console.error(e);
    }
    setVisible6(false);
    commerceStore.saleStore.fetchUpdated();
  };

  const actionHandlers = {
    onAddSales: () => setVisible1(true),
    onAddTempSales: () => setVisible5(true),
    onAddLabor: () => setVisible2(true),
    onAddPayment: () => setVisible3(true),
    onAddChange: () => setVisible4(true),
    onAddLoan: () => setVisible6(true),
  };

  if (!theItem) return <></>;

  return (
    <div className="dark:text-white text-teal-700 relative">
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <Commerce.InventoryLog.Form
          item={{
            sale: theItem.id as number,
            logType: LOG_TYPE_CHOICES.findIndex((t) => t === "Sale"),
            comingFrom: LocationIdMap["Gen Luna Main"],
          }}
          setVisible={setVisible1}
          hiddenFields={["logType", "purchase", "sale", "goingTo"]}
          fetchFcn={commerceStore.saleStore.fetchUpdated}
        />
      </MyModal>

      <MyModal isVisible={isVisible2} setVisible={setVisible2}>
        <Commerce.Labor.Form
          item={{ sale: theItem.id as number }}
          setVisible={setVisible2}
          fetchFcn={commerceStore.saleStore.fetchUpdated}
          hiddenFields={["sale", "collection"]}
        />
      </MyModal>

      <MyModal isVisible={isVisible3} setVisible={setVisible3}>
        <Finance.Transaction.Form
          item={{
            sale: theItem.id as number,
            comingFrom: AccountIdMap["Stocks"],
            goingTo: AccountIdMap["Cash Register"],
            category: CategoryIdMap["Product Sales"],
            description: `Payment for C#${theItem.id}`,
          }}
          setVisible={setVisible3}
          fetchFcn={commerceStore.saleStore.fetchUpdated}
          hiddenFields={[
            "sale",
            "purchase",
            "labor",
            "comingFrom",
            "description",
            "category",
          ]}
        />
      </MyModal>

      <MyConfirmModal
        statement={`Dispense change of ${toMoney(theItem.change)}?`}
        isVisible={isVisible4}
        setVisible={setVisible4}
        onClickCheck={handleDispenseChange}
      />

      <MyModal isVisible={isVisible5} setVisible={setVisible5}>
        <Commerce.TemporarySale.Form
          item={{ sale: theItem.id as number }}
          setVisible={setVisible5}
          fetchFcn={commerceStore.saleStore.fetchUpdated}
          hiddenFields={["sale"]}
        />
      </MyModal>

      <MyConfirmModal
        statement={`Create a Promissory Note of ${toMoney(
          item?.amountPayable
        )} (Receivable on ${moment(new Date())
          .add(1, "month")
          .format("MMM D, YYYY")})?`}
        isVisible={isVisible6}
        setVisible={setVisible6}
        onClickCheck={handleAddLoan}
      />

      <div className="p-4">{theItem.displayName}</div>

      <Commerce.InventoryLog.Table
        items={salesItems}
        shownFields={[
          "displayName",
          "quantity",
          "unitAmount",
          "subtotalAmount",
          "isCollected",
        ]}
      />

      <Commerce.TemporarySale.Table
        items={tempSalesItems}
        shownFields={[
          "displayName",
          "quantity",
          "unitAmount",
          "subtotalAmount",
        ]}
      />

      <Commerce.Labor.Table
        items={laborItems}
        shownFields={["laborType", "employees", "cost", "compensationAmount"]}
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
      modal: ItemsForm,
      onClick: () => setValue({ ...value, itemId: item.id }),
    },
  ] satisfies ActionModalDef[];
};

const MainModals = [] satisfies ActionModalDef[];

export const SaleComponents = MyGenericComponents(
  Sale,
  SaleFields,
  getPathParts("commerce", "Sale"),
  SideB,
  MainModals,
  MoreModals
);
