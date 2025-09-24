import { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { MyIcon } from "./MyIcon";
import { keyListToObject, mySum, toMoney } from "../constants/helpers";
import { Field, Option } from "../constants/interfaces";
import { useVisible } from "../constants/hooks";
import { MyModal } from "./MyModal";
import { MyForm } from "./MyForm";
import { FetchItemResult } from "./MyGenericComponents/MyGenericStore";
import { kebabCase } from "lodash";

export type MyInputProps = {
  hidden?: boolean;
  label?: string;
  value?: string;
  onChangeValue?: (t: string) => void;
  corrector?: (t: string) => string;
  pattern?: string;
  isPassword?: boolean;
  optional?: boolean;
  msg?: string;
  placeholder?: string;
  checkpoint?: boolean;
  checkAction?: () => Promise<void>;
  disabled?: boolean;
  flex?: number;
  numeric?: boolean;
  centered?: boolean;
  maxLength?: number;
  autoCapitalize?: boolean;
  type?: string;
  searchFcn?: (t: string) => any;
  enlarged?: boolean;
  multiline?: boolean;
};

export const MyInput = (props: MyInputProps) => {
  const {
    hidden,
    label,
    value,
    onChangeValue,
    corrector,
    isPassword,
    // optional,
    msg,
    placeholder,
    checkpoint,
    type,
    checkAction,
    disabled,
    flex,
    numeric,
    centered,
    maxLength,
    autoCapitalize,
    enlarged,
    searchFcn,
    multiline,
  } = props;

  const [editable, setEditable] = useState(true);
  const { isVisible1, setVisible1 } = useVisible();
  const [opt, setOpt] = useState<Option[]>([]);

  const denominations = [
    "1000",
    "500",
    "200",
    "100",
    "50",
    "20",
    "10",
    "5",
    "1",
  ];

  const [amountDetails, setAmountDetails] = useState(
    keyListToObject(denominations, "0")
  );

  const onChangeCorrect = (t: string) => {
    let newVal = corrector ? corrector(t) : t;
    onChangeValue?.(newVal);
  };

  const onCheck = useCallback(async () => {
    if (checkAction) await checkAction();
    setEditable(false);
  }, []);

  const onEdit = useCallback(() => {
    setEditable(true);
  }, []);

  const onSubmitAmountDetails = () => {
    if (!isNaN(amountTotal)) onChangeValue?.(amountTotal.toString());
    setVisible1(false);
    setAmountDetails(keyListToObject(denominations, "0"));
  };

  const amountTotal = mySum(
    Object.values(amountDetails).map(
      (u: string, ind) =>
        parseInt(u) * parseInt(denominations[denominations.length - ind - 1])
    )
  );

  const fetchText = async () => {
    if (!searchFcn) return;
    const resp: FetchItemResult = await searchFcn?.(
      `page=1&${kebabCase(label)}__search=${value}`
    );

    if (!resp.ok && !resp.data) return;

    setOpt(
      resp.data?.map((s, ind) => ({
        name: s[kebabCase(label)],
        id: ind,
      })) ?? []
    );
  };

  const fields = [
    [
      {
        name: "",
        label: "Amount Total",
        type: "function",
        function: () => toMoney(amountTotal),
      },
    ],
    ...denominations.map((s) => [{ name: s, label: s, type: "number" }]),
  ] satisfies Field[][];

  return (
    !hidden && (
      <View style={[styles.main, { flex: flex ? flex : 0 }]}>
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <MyForm
            fields={fields}
            title="Calculate"
            details={amountDetails}
            setDetails={setAmountDetails}
            onPressSubmit={onSubmitAmountDetails}
          />
        </MyModal>
        <View style={styles.textInput}>
          {label && <Text>{label}</Text>}
          <View style={{ flexDirection: "row", gap: 5 }}>
            <TextInput
              onChangeText={onChangeCorrect}
              value={String(value)}
              style={[
                styles.input,
                {
                  backgroundColor: editable && !disabled ? "white" : "#ddd",
                  textAlign:
                    centered || type === "amount" || type === "number"
                      ? "center"
                      : numeric
                      ? "right"
                      : "left",
                  borderRadius: 5,
                  flex: 1,
                },
              ]}
              editable={editable && !disabled}
              placeholder={placeholder ?? label}
              keyboardType={
                numeric || type === "amount" || type === "number"
                  ? "numeric"
                  : "default"
              }
              maxLength={maxLength}
              autoCapitalize={autoCapitalize ? "characters" : undefined}
              secureTextEntry={isPassword}
              multiline={multiline}
            />
            <MyIcon
              icon="calculator"
              onPress={() => setVisible1(true)}
              hidden={type !== "amount"}
            />
          </View>
          {msg && <Text style={{ color: "darkred" }}>{msg}</Text>}
        </View>
        {checkpoint && (
          <MyIcon
            icon={!editable ? "edit" : "check"}
            onPress={!editable ? onEdit : onCheck}
          />
        )}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 3,
  },
  textInput: {
    padding: 3,
    flex: 1,
  },
});
