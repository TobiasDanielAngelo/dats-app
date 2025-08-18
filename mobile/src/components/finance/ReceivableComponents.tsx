// ReceivableComponents.tsx
import { useState } from "react";
import { MyForm } from "../../blueprints/MyForm";
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts, toOptions } from "../../constants/helpers";
import { ActionModalDef, Field } from "../../constants/interfaces";
import { useStore } from "../core/Store";
import { AccountIdMap } from "./AccountStore";
import { CategoryIdMap } from "./CategoryStore";
import { Receivable, ReceivableFields } from "./ReceivableStore";

const ReceivablePaymentForm = ({ item }: { item: Receivable }) => {
  const { financeStore } = useStore();
  const [details, setDetails] = useState({
    amount: item.amount - (item.paymentTotal ?? 0),
    category: CategoryIdMap["Customer Credit"],
    goingTo: AccountIdMap["Cash Register"],
  });
  const fields = [
    [{ name: "amount", label: "Amount", type: "number" }],
    [
      {
        name: "category",
        label: "Category",
        type: "select",
        options: toOptions(financeStore.categoryStore.items, "displayName"),
        fetchFcn: financeStore.categoryStore.fetchTemp,
        searchFcn: financeStore.categoryStore.fetchTemp,
      },
    ],
    [
      {
        name: "goingTo",
        label: "Going To",
        type: "select",
        options: toOptions(financeStore.accountStore.items, "displayName"),
        fetchFcn: financeStore.accountStore.fetchTemp,
        searchFcn: financeStore.accountStore.fetchTemp,
      },
    ],
  ] satisfies Field[][];

  const onPressSubmit = async () => {
    const resp = await financeStore.transactionStore.addItem(details);
    if (!resp.ok && !resp.data) return;
    financeStore.receivableStore.updateItem(item.id, {
      payments: [...(item.payments ?? []), resp.data?.id as number],
    });
  };
  return (
    <MyForm
      fields={fields}
      title="Receivable Payment"
      details={details}
      setDetails={setDetails}
      onPressSubmit={onPressSubmit}
    />
  );
};

const MoreModals = (item: Receivable) => {
  return [
    {
      icon: "Payment",
      name: "Receivables",
      label: "Payment",
      modal: () => <ReceivablePaymentForm item={item} />,
      hidden: !!item.dateCompleted,
    },
  ] satisfies ActionModalDef[];
};

export const ReceivableComponents = MyGenericComponents(
  Receivable,
  ReceivableFields,
  getPathParts("finance", "Receivable"),
  { MoreModals }
);
