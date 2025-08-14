import { observer } from "mobx-react-lite";
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts, toMoney } from "../../constants/helpers";
import { Purchase, PurchaseFields } from "./PurchaseStore";
import { useStore } from "../core/Store";
import { useContext, useEffect, useState } from "react";
import { useVisible } from "../../constants/hooks";
import { InventoryLog } from "./InventoryLogStore";
import { MyConfirmModal, MyInput } from "../../blueprints";
import { MyModal } from "../../blueprints/MyModal";
import { MyIcon } from "../../blueprints/MyIcon";
import { Transaction } from "../finance/TransactionStore";
import { Commerce } from "./_AllComponents";
import { LOG_TYPE_CHOICES } from "./_AllChoices";
import { LocationIdMap } from "../product/LocationStore";
import { Finance } from "../finance/_AllComponents";
import { AccountIdMap } from "../finance/AccountStore";
import { CategoryIdMap } from "../finance/CategoryStore";
import { ActionModalDef } from "../../constants/interfaces";

const ItemsForm = observer(
  (props: { item?: Purchase; setVisible?: (t: boolean) => void }) => {
    const { item } = props;
    const { commerceStore, financeStore } = useStore();

    const context = useContext(PurchaseComponents.MoreContext);

    const {
      isVisible1,
      setVisible1,
      isVisible2,
      setVisible2,
      isVisible3,
      setVisible3,
      isVisible4,
      setVisible4,
    } = useVisible();
    const currentItem = context.value
      ? commerceStore.purchaseStore.allItems.get(context.value.itemId)
      : undefined;

    const theItem = currentItem ?? item;

    const purchaseItems = commerceStore.inventoryLogStore.items.filter((s) =>
      theItem?.purchaseItems.includes(s.id as number)
    );

    const transactionItems = financeStore.transactionStore.items.filter((s) =>
      theItem?.transactionItems.includes(s.id as number)
    );

    const PurchaseItemRow = (props: { item: InventoryLog }) => {
      const { item } = props;
      const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
      const [amt, setAmt] = useState(item.quantity.toString());
      return (
        <div className="flex flex-row">
          <MyConfirmModal
            isVisible={isVisible2}
            setVisible={setVisible2}
            onClickCheck={() => {
              commerceStore.purchaseStore.fetchUpdated();
              commerceStore.inventoryLogStore.deleteItem(item.id);
            }}
            objectName={"Purchase Item"}
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
                  commerceStore.purchaseStore.fetchUpdated();
                }}
              />
            </div>
          </MyModal>
          <MyIcon icon="Edit" onClick={() => setVisible1(true)} />
          <MyIcon icon="Close" onClick={() => setVisible2(true)} />
        </div>
      );
    };

    const TransactionItemRow = (props: { item: Transaction }) => {
      const { item } = props;
      const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
      const [values, setValues] = useState({
        amount: item.amount.toString(),
      });

      return (
        <div className="flex flex-row">
          <MyConfirmModal
            isVisible={isVisible2}
            setVisible={setVisible2}
            onClickCheck={() => {
              commerceStore.saleStore.fetchUpdated();
              financeStore.transactionStore.deleteItem(item.id);
            }}
            objectName={"Transaction Item"}
            actionName="Delete"
          />
          <MyModal isVisible={isVisible1} setVisible={setVisible1}>
            <div className="flex flex-row justify-center items-center gap-2">
              <MyInput
                type="number"
                onChangeValue={(t) => setValues({ ...values, amount: t })}
                value={values.amount}
                label="Amount"
                noCalc
              />
              <MyIcon
                icon="Check"
                onClick={() => {
                  financeStore.transactionStore.updateItem(item.id, {
                    amount: Math.round(parseFloat(values.amount)),
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
          `page=1&id__in=${theItem?.purchaseItems.join(",")}`
        );
      }
    }, [theItem?.purchaseItems.length, purchaseItems.length]);

    useEffect(() => {
      if (theItem) {
        financeStore.transactionStore.fetchAll(
          `page=1&id__in=${theItem?.transactionItems.join(",")}`
        );
      }
    }, [theItem?.transactionItems.length, transactionItems.length]);

    if (!theItem) return <></>;
    return (
      <div className="dark:text-white text-teal-700 relative">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Commerce.InventoryLog.Form
            item={{
              purchase: (theItem?.id ?? -1) as number,
              logType: LOG_TYPE_CHOICES.findIndex((t) => t === "Purchase"),
              goingTo: LocationIdMap["Gen Luna Main"],
            }}
            setVisible={setVisible1}
            hiddenFields={["logType", "purchase", "sale", "comingFrom"]}
            fetchFcn={commerceStore.purchaseStore.fetchUpdated}
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3}>
          <Finance.Transaction.Form
            item={{
              sale: (theItem?.id ?? -1) as number,
              goingTo: AccountIdMap["Stocks"],
              category: CategoryIdMap["Supplies"],
              description: `Payment for P#${theItem.id}`,
            }}
            setVisible={setVisible3}
            fetchFcn={commerceStore.purchaseStore.fetchUpdated}
            hiddenFields={[
              "sale",
              "purchase",
              "goingTo",
              "description",
              "category",
            ]}
          />
        </MyModal>
        <div className="p-4">{theItem?.displayName}</div>
        <Commerce.InventoryLog.Table
          items={purchaseItems}
          shownFields={[
            "displayName",
            "quantity",
            "unitAmount",
            "subtotalAmount",
          ]}
          renderActions={(item) => <PurchaseItemRow item={item} />}
        />
        <Finance.Transaction.Table
          items={transactionItems}
          shownFields={["description", "amount"]}
          renderActions={(item) => <TransactionItemRow item={item} />}
        />
        <div
          className="absolute flex flex-row gap-3"
          style={{ top: 10, right: 10 }}
        >
          <MyIcon
            icon="Inbox"
            label="Add Purchase Item"
            fontSize="large"
            onClick={() => setVisible1(true)}
            hidden={!theItem}
          />
          <MyIcon
            icon="Payment"
            label="Add Payment"
            fontSize="large"
            onClick={() => setVisible3(true)}
            hidden={!theItem}
          />
        </div>
      </div>
    );
  }
);

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
      name: "Sales",
      label: "Sales",
      modal: ItemsForm,
      onClick: () => setValue({ ...value, itemId: item.id }),
    },
  ] satisfies ActionModalDef[];
};

const MainModals = [] satisfies ActionModalDef[];

export const PurchaseComponents = MyGenericComponents(
  Purchase,
  PurchaseFields,
  getPathParts(import.meta.url, "Components"),
  SideB,
  MainModals,
  MoreModals
);
