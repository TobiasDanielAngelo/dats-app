import { observer } from "mobx-react-lite";
import { useContext, useEffect, useState } from "react";
import { MyConfirmModal, MyInput } from "../../blueprints";
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { getPathParts, toMoney } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef } from "../../constants/interfaces";
import { useStore } from "../core/Store";
import { Finance } from "../finance/_AllComponents";
import { AccountIdMap } from "../finance/AccountStore";
import { CategoryIdMap } from "../finance/CategoryStore";
import { Transaction } from "../finance/TransactionStore";
import { LocationIdMap } from "../product/LocationStore";
import { LOG_TYPE_CHOICES } from "./_AllChoices";
import { Commerce } from "./_AllComponents";
import { InventoryLog } from "./InventoryLogStore";
import { Labor } from "./LaborStore";
import { Sale, SaleFields } from "./SaleStore";

const ItemsForm = observer(
  (props: { item?: Sale; setVisible?: (t: boolean) => void }) => {
    const { item } = props;
    const { commerceStore, financeStore } = useStore();

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
    } = useVisible();
    const currentItem = context.value
      ? commerceStore.saleStore.allItems.get(context.value.itemId)
      : undefined;

    const theItem = currentItem ?? item;

    const salesItems = commerceStore.inventoryLogStore.items.filter((s) =>
      theItem?.salesItems.includes(s.id as number)
    );

    const laborItems = commerceStore.laborStore.items.filter((s) =>
      theItem?.laborItems.includes(s.id as number)
    );

    const transactionItems = financeStore.transactionStore.items.filter((s) =>
      theItem?.transactionItems.includes(s.id as number)
    );

    const SalesItemRow = (props: { item: InventoryLog }) => {
      const { item } = props;
      const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
      const [amt, setAmt] = useState(item.quantity.toString());

      const onClickCheckBox = async () => {
        await commerceStore.inventoryLogStore.updateItem(item.id, {
          isCollected: !item.isCollected,
        });
        commerceStore.saleStore.fetchUpdated();
      };

      return (
        <div className="flex flex-row">
          <MyConfirmModal
            isVisible={isVisible2}
            setVisible={setVisible2}
            onClickCheck={() => {
              commerceStore.saleStore.fetchUpdated();
              commerceStore.inventoryLogStore.deleteItem(item.id);
            }}
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
          <MyIcon
            icon={item.isCollected ? "CheckBox" : "CheckBoxOutlineBlank"}
            onClick={onClickCheckBox}
          />
          <MyIcon icon="Edit" onClick={() => setVisible1(true)} />
          <MyIcon icon="Close" onClick={() => setVisible2(true)} />
        </div>
      );
    };

    const LaborItemRow = (props: { item: Labor }) => {
      const { item } = props;
      const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
      const [values, setValues] = useState({
        cost: item.cost.toString(),
        compAmt: item.compensationAmount.toString(),
      });

      const onClickCheckBox = async () => {
        await commerceStore.laborStore.updateItem(item.id, {
          isPaid: !item.isPaid,
        });
        commerceStore.saleStore.fetchUpdated();
      };
      return (
        <div className="flex flex-row">
          <MyConfirmModal
            isVisible={isVisible2}
            setVisible={setVisible2}
            onClickCheck={() => {
              commerceStore.saleStore.fetchUpdated();
              commerceStore.laborStore.deleteItem(item.id);
            }}
            objectName={"Labor Item"}
            actionName="Delete"
          />
          <MyModal isVisible={isVisible1} setVisible={setVisible1}>
            <div className="flex flex-row justify-center items-center gap-2">
              <MyInput
                type="number"
                onChangeValue={(t) => setValues({ ...values, cost: t })}
                value={values.cost}
                label="Cost"
                noCalc
              />
              <MyInput
                type="number"
                onChangeValue={(t) => setValues({ ...values, compAmt: t })}
                value={values.compAmt}
                label="Compensation"
                noCalc
              />
              <MyIcon
                icon="Check"
                onClick={() => {
                  commerceStore.laborStore.updateItem(item.id, {
                    cost: Math.round(parseFloat(values.cost)),
                    compensationAmount: Math.round(parseFloat(values.compAmt)),
                  });
                  setVisible1(false);
                  commerceStore.saleStore.fetchUpdated();
                }}
              />
            </div>
          </MyModal>
          <MyIcon
            icon={item.isPaid ? "CheckBox" : "CheckBoxOutlineBlank"}
            onClick={onClickCheckBox}
          />
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
        commerceStore.laborStore.fetchAll(
          `page=1&id__in=${theItem?.laborItems.join(",")}`
        );
      }
    }, [
      theItem?.laborItems.length,
      laborItems.length,
      commerceStore.saleStore.lastUpdated,
    ]);

    useEffect(() => {
      if (theItem) {
        commerceStore.inventoryLogStore.fetchAll(
          `page=1&id__in=${theItem?.salesItems.join(",")}`
        );
      }
    }, [
      theItem?.salesItems.length,
      salesItems.length,
      commerceStore.saleStore.lastUpdated,
    ]);

    useEffect(() => {
      if (theItem) {
        financeStore.transactionStore.fetchAll(
          `page=1&id__in=${theItem?.transactionItems.join(",")}`
        );
      }
    }, [
      theItem?.transactionItems.length,
      transactionItems.length,
      commerceStore.saleStore.lastUpdated,
    ]);

    if (!theItem) return <></>;
    return (
      <div className="dark:text-white text-teal-700 relative">
        <MyConfirmModal
          statement={`Dispense change of ${toMoney(theItem?.change)}?`}
          isVisible={isVisible4}
          setVisible={setVisible4}
          onClickCheck={() => {
            financeStore.transactionStore.addItem({
              sale: theItem.id as number,
              comingFrom: AccountIdMap["Stocks"],
              goingTo: AccountIdMap["Cash Register"],
              category: CategoryIdMap["Product Sales"],
              description: `Change for C#${theItem.id}`,
              amount: -theItem?.change,
            });
            setVisible4(false);
            commerceStore.saleStore.fetchUpdated();
          }}
        />
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Commerce.InventoryLog.Form
            item={{
              sale: (theItem?.id ?? -1) as number,
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
            item={{
              sale: (theItem?.id ?? -1) as number,
            }}
            setVisible={setVisible2}
            fetchFcn={commerceStore.saleStore.fetchUpdated}
            hiddenFields={["sale", "collection"]}
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3}>
          <Finance.Transaction.Form
            item={{
              sale: (theItem?.id ?? -1) as number,
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
              "comingFrom",
              "description",
              "category",
            ]}
          />
        </MyModal>
        <div className="p-4">{theItem?.displayName}</div>
        <Commerce.InventoryLog.Table
          items={salesItems}
          shownFields={[
            "displayName",
            "quantity",
            "unitAmount",
            "subtotalAmount",
            "isCollected",
          ]}
          renderActions={(item) => <SalesItemRow item={item} />}
        />
        <Commerce.Labor.Table
          items={laborItems}
          shownFields={["laborType", "employees", "cost", "compensationAmount"]}
          renderActions={(item) => <LaborItemRow item={item} />}
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
            label="Add Sales"
            fontSize="large"
            onClick={() => setVisible1(true)}
            hidden={!theItem}
          />
          <MyIcon
            icon="PrecisionManufacturing"
            label="Add Labor"
            fontSize="large"
            onClick={() => setVisible2(true)}
            hidden={!theItem}
          />
          <MyIcon
            icon="Payment"
            label="Add Payment"
            fontSize="large"
            onClick={() => setVisible3(true)}
            hidden={!theItem}
          />
          <MyIcon
            icon="Toll"
            label="Change"
            fontSize="large"
            onClick={() => setVisible4(true)}
            hidden={!theItem}
          />
        </div>
      </div>
    );
  }
);

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
  getPathParts(import.meta.url, "Components"),
  SideB,
  MainModals,
  MoreModals
);
