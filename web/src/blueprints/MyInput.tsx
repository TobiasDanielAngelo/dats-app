import { useEffect, useState } from "react";
import {
  correctNumberInput,
  keyListToObject,
  mySum,
  toMoney,
} from "../constants/helpers";
import { useVisible } from "../constants/hooks";
import { Field, Option } from "../constants/interfaces";
import { MyForm } from "./MyForm";
import { MyIcon } from "./MyIcon";
import { MyModal } from "./MyModal";
import { kebabCase } from "lodash";
import { FetchItemResult } from "./MyGenericComponents/MyGenericStore";

export const MyInput = (props: {
  hidden?: boolean;
  label?: string;
  value?: string;
  onChangeValue?: (t: string) => void;
  corrector?: (t: string) => string;
  pattern?: string;
  centered?: boolean;
  isPassword?: boolean;
  optional?: boolean;
  searchFcn?: (t: string) => any;
  msg?: string;
  type?: string;
}) => {
  const {
    hidden,
    label,
    onChangeValue,
    value,
    corrector,
    centered,
    pattern,
    isPassword,
    optional,
    searchFcn,
    msg,
    type,
  } = props;
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

  const amountTotal = mySum(
    Object.values(amountDetails).map(
      (u: string, ind) =>
        parseInt(u) * parseInt(denominations[denominations.length - ind - 1])
    )
  );
  const onChangeCorrect = (t: string) => {
    let newVal = corrector
      ? corrector(t)
      : ["number", "amount"].includes(type ?? "")
      ? correctNumberInput(t)
      : t;
    onChangeValue?.(newVal);
  };

  const onSubmitAmountDetails = () => {
    if (!isNaN(amountTotal)) onChangeValue?.(amountTotal.toString());
    setVisible1(false);
    setAmountDetails(keyListToObject(denominations, "0"));
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

  useEffect(() => {
    if (value === "") {
      setOpt([]);
      return;
    }
    const timer = setTimeout(() => {
      value !== "" && fetchText();
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  return hidden ? (
    <></>
  ) : (
    <div className={styles.container}>
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <MyForm
          fields={fields}
          title="Calculate"
          details={amountDetails}
          setDetails={setAmountDetails}
          onClickSubmit={onSubmitAmountDetails}
        />
      </MyModal>
      <div className={styles.subcon}>
        <input
          type={isPassword ? "password" : undefined}
          name={label}
          style={{
            textAlign:
              centered || type === "number" || type === "amount"
                ? "center"
                : undefined,
          }}
          className={styles.input}
          placeholder=" "
          pattern={pattern}
          required={!optional}
          value={value}
          onChange={(e) => onChangeCorrect(e.target.value)}
        />
        {!opt.map((s) => s.name).includes(value ?? "") && opt.length > 0 ? (
          <ul className={styles.ul}>
            {opt?.map((opt) => (
              <li
                key={opt.id}
                onClick={() => {
                  onChangeValue?.(opt.name);
                }}
                className={styles.li}
              >
                {opt.name}
              </li>
            ))}
          </ul>
        ) : (
          <></>
        )}
        {type === "amount" ? (
          <MyIcon icon="Calculate" onClick={() => setVisible1(true)} />
        ) : (
          <></>
        )}
      </div>
      <label className={styles.label}>{label}</label>
      <label className={styles.msg}>{msg}</label>
    </div>
  );
};

const styles = {
  input:
    "block w-full py-2.5 text-sm text-gray-900 bg-transparent border-b-2 border-teal-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:border-blue-600 peer",
  ul: "absolute w-full top-10 z-51 border border-teal-400 dark:bg-gray-800",
  li: "bg-teal-100 text-sm cursor-pointer px-4 py-2 dark:text-white hover:bg-teal-200 dark:hover:bg-gray-600",
  label:
    "absolute top-3 text-sm text-gray-500 dark:text-gray-400 transform transition duration-300 -translate-y-6 scale-90 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-90 peer-focus:text-blue-600 peer-focus:dark:text-blue-500",
  msg: "block mb-3 text-xs font-medium text-red-600 dark:text-white",
  subcon: "flex relative",
  container: "relative w-full mt-3",
};
