import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import {
  MyConfirmModal,
  MyDateTimePicker,
  MyMultiDropdownSelector,
} from "../../blueprints";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { MyTable } from "../../blueprints/MyTable";
import { winWidth } from "../../constants/constants";
import { mySum, toMoney, toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef } from "../../constants/interfaces";
import { Main } from "../core/_AllComponents";
import { useStore } from "../core/Store";
import { Account, AccountIdMap } from "./AccountStore";
import { CategoryIdMap } from "./CategoryStore";
import { Transaction } from "./TransactionStore";
import { MyForm } from "../../blueprints/MyForm";
import { TYPE_CHOICES } from "./_AllChoices";

const AccountTransactionRow = ({ item }: { item: Transaction }) => {
  const { financeStore } = useStore();
  const { isVisible1, setVisible1 } = useVisible();

  return (
    <View>
      <MyConfirmModal
        statement="Delete this item?"
        isVisible={isVisible1}
        setVisible={setVisible1}
        onPressCheck={() => financeStore.transactionStore.deleteItem(item.id)}
      />
      <MyIcon icon="times" onPress={() => setVisible1(true)} />
    </View>
  );
};

const TransferTransactionTable = observer(
  ({ uneditable, date }: { date: string; uneditable?: boolean }) => {
    const { financeStore } = useStore();
    const { isVisible1, setVisible1 } = useVisible();
    const defaultDetails = {
      comingFrom: null,
      goingTo: null,
      amount: 0,
    };
    const [details, setDetails] = useState(defaultDetails);

    const items = financeStore.transactionStore.items.filter((t) => {
      const created = moment(t.createdAt);
      const target = moment(date, "MMM D, YYYY");
      return (
        t.comingFrom !== null &&
        t.goingTo !== null &&
        created.isSame(target, "day")
      );
    });

    const matrix = [
      [
        "From",
        "To",
        "Amount",
        !uneditable && <MyIcon icon="plus" onPress={() => setVisible1(true)} />,
      ],
      ...items.map((s) => [
        financeStore.accountStore.allItems.get(s.comingFrom as number)
          ?.displayName,
        financeStore.accountStore.allItems.get(s.goingTo as number)
          ?.displayName,
        toMoney(s.amount),
        !uneditable && <AccountTransactionRow item={s} />,
      ]),
      ...Array.from(Array(Math.max(0, 3 - items.length)).keys()).map((s) => [
        "",
        "",
        "",
      ]),
    ];

    const availableTypes = [
      "Cash",
      "Coins",
      "Cash + Coins",
      "Savings",
      "Checking",
    ];

    const onPressSubmit = () => {
      financeStore.transactionStore.addItem(details);
      setVisible1(false);
      setDetails(defaultDetails);
    };

    const fields = [
      [
        {
          name: "comingFrom",
          label: "From",
          type: "select",
          options: toOptions(
            financeStore.accountStore.items.filter(
              (s) =>
                availableTypes
                  .map((t) => TYPE_CHOICES.findIndex((u) => u === t))
                  .includes(s.type) && details.goingTo !== s.id
            ),
            "displayName"
          ),
        },
      ],
      [
        {
          name: "goingTo",
          label: "From",
          type: "select",
          options: toOptions(
            financeStore.accountStore.items.filter(
              (s) =>
                availableTypes
                  .map((t) => TYPE_CHOICES.findIndex((u) => u === t))
                  .includes(s.type) && details.comingFrom !== s.id
            ),
            "displayName"
          ),
        },
      ],
      [{ name: "amount", label: "Amount", type: "amount" }],
    ];

    return (
      <View>
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <MyForm
            fields={fields}
            title="New Transfer"
            details={details}
            setDetails={setDetails}
            onPressSubmit={onPressSubmit}
          />
        </MyModal>
        <Text>Transfers</Text>
        <View style={{ flex: 1 }}>
          <MyTable
            matrix={matrix}
            widths={[0.25, 0.25, 0.15, 0.05].map((s) => winWidth * s)}
          />
        </View>
      </View>
    );
  }
);

const AccountExpenseTable = observer(
  ({
    transactionItems,
    item,
    uneditable,
  }: {
    transactionItems: Transaction[];
    item: Account;
    date: string;
    uneditable?: boolean;
  }) => {
    const { financeStore } = useStore();
    const { isVisible1, setVisible1 } = useVisible();
    const items = transactionItems.filter(
      (s) => s.comingFrom === item.id && s.goingTo === null
    );

    const matrix = [
      [
        "Description",
        "Category",
        "Amount",
        !uneditable && <MyIcon icon="plus" onPress={() => setVisible1(true)} />,
      ],
      ...items.map((s) => [
        s.description,
        financeStore.categoryStore.allItems.get(s.category as number)?.title,
        toMoney(s.amount),
        !uneditable && <AccountTransactionRow item={s} />,
      ]),
      ...Array.from(Array(Math.max(0, 3 - items.length)).keys()).map(() => [
        "",
        "",
        "",
      ]),
    ];

    return (
      <View>
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Main.Finance.Transaction.Form
            item={{
              category: CategoryIdMap["Miscellaneous"],
              comingFrom: item.id as number,
            }}
            hiddenFields={["sale", "purchase", "labor", "goingTo"]}
            setVisible={setVisible1}
          />
        </MyModal>
        <Text>Expenses: {item.displayName}</Text>
        <View style={{ flex: 1 }}>
          <MyTable
            matrix={matrix}
            widths={[0.45, 0.2, 0.15, 0.05].map((s) => winWidth * s)}
          />
          <Text style={{ textAlign: "right", paddingRight: 10 }}>
            Subtotal: ({toMoney(mySum(items.map((s) => s.amount)))})
          </Text>
        </View>
      </View>
    );
  }
);

const isWithin = (date: string) => {
  const target = moment(date, "MMM D, YYYY");
  const daysDiff = moment().startOf("day").diff(target.startOf("day"), "days");
  return daysDiff >= 0 && daysDiff <= 2;
};

export const TransactionQuickView = observer(() => {
  const { financeStore } = useStore();
  const [date, setDate] = useState(moment().format("MMM D, YYYY"));
  const { isVisible1, setVisible1 } = useVisible();
  const [accounts, setAccounts] = useState<(string | number)[]>([
    "Cash Register",
    "Cash Box",
  ]);

  const targetAccounts = financeStore.accountStore.items
    .filter((s) => accounts.includes(s.displayName))
    .sort((a, b) => {
      return (
        (accounts?.indexOf(a.name) ?? 0) - (accounts?.indexOf(b.name) ?? 0)
      );
    });

  const transactionItems = financeStore.transactionStore.items.filter((t) => {
    const created = moment(t.createdAt);
    const target = moment(date, "MMM D, YYYY");
    return created.isSame(target, "day");
  });

  const expenseItems = transactionItems.filter((s) => s.goingTo === null);
  const expenseTotal = mySum(expenseItems.map((s) => s.amount));

  const incomeNet = mySum(
    transactionItems
      .filter((s) => s.goingTo !== null)
      .map((s) => {
        const comingFrom =
          s.comingFrom === AccountIdMap["Cash Register"] ? 0 : s.amount;
        const goingTo =
          s.goingTo === AccountIdMap["Cash Register"] ? 0 : s.amount;
        return goingTo - comingFrom;
      })
  );
  const incomeGross =
    incomeNet +
    mySum(
      transactionItems
        .filter(
          (s) =>
            s.goingTo === null && s.comingFrom === AccountIdMap["Cash Register"]
        )
        .map((s) => s.amount)
    );

  useEffect(() => {
    const day = moment(date, "MMM D, YYYY");
    financeStore.transactionStore.fetchAll(
      `page=all&created_at__gte=${day
        .startOf("day")
        .toISOString()}&created_at__lte=${day.endOf("day").toISOString()}`
    );
  }, [date]);
  useEffect(() => {
    financeStore.accountStore.fetchAll("page=all");
    financeStore.categoryStore.fetchAll("page=all");
  }, []);

  return (
    <>
      <View style={{ margin: 10, flex: 1 }}>
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <View style={{ paddingVertical: 30 }}>
            <MyDateTimePicker value={date} onChangeValue={setDate} isDateOnly />
          </View>

          <MyMultiDropdownSelector
            value={accounts}
            onChangeValue={setAccounts}
            options={financeStore.accountStore.items.map((s) => ({
              name: s.displayName,
              id: s.displayName,
            }))}
          />
        </MyModal>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 15 }}>Daily Sales Report</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <MyIcon
              icon="chevron-left"
              size={12}
              color="blue"
              onPress={() =>
                setDate(
                  moment(date, "MMM D, YYYY")
                    .add(-1, "day")
                    .format("MMM D, YYYY")
                )
              }
            />
            <Text
              onPress={() => setVisible1(true)}
              style={{
                fontSize: 15,
                color: "blue",
                textDecorationLine: "underline",
              }}
            >
              {moment(date, "MMM D, YYYY").format("MMMM D, YYYY")}
            </Text>
            <MyIcon
              icon="chevron-right"
              size={12}
              color="blue"
              onPress={() =>
                setDate(
                  moment(date, "MMM D, YYYY")
                    .add(1, "day")
                    .format("MMM D, YYYY")
                )
              }
            />
          </View>
        </View>
        <ScrollView>
          {targetAccounts.map((s, ind) => (
            <AccountExpenseTable
              transactionItems={transactionItems}
              item={s}
              date={date}
              uneditable={!isWithin(date)}
              key={ind}
            />
          ))}
          <TransferTransactionTable date={date} uneditable={!isWithin(date)} />
          <View
            style={{ flexDirection: "row", justifyContent: "space-evenly" }}
          >
            <View>
              <Text>Today's Income (Gross)</Text>
              <Text>{toMoney(incomeGross)}</Text>
            </View>
            <View>
              <Text>Today's Income (Net)</Text>
              <Text>{toMoney(incomeNet)}</Text>
            </View>
            <View>
              <Text>Today's Expenses</Text>
              <Text>{toMoney(-expenseTotal)}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
});
