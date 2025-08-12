import { HTMLInputTypeAttribute, useState } from "react";
import {
  correctNumberInput,
  keyListToObject,
  mySum,
  toMoney,
} from "../constants/helpers";
import { useVisible } from "../constants/hooks";
import { Field } from "../constants/interfaces";
import { MyForm } from "./MyForm";
import { MyIcon } from "./MyIcon";
import { MyModal } from "./MyModal";

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
  msg?: string;
  type?: HTMLInputTypeAttribute;
  noCalc?: boolean;
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
    noCalc,
    msg,
    type,
  } = props;
  const { isVisible1, setVisible1 } = useVisible();

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
      : type === "number"
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

  return hidden ? (
    <></>
  ) : (
    <div className="relative z-0 w-full mt-3 group">
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <MyForm
          fields={fields}
          title="Calculate"
          details={amountDetails}
          setDetails={setAmountDetails}
          onClickSubmit={onSubmitAmountDetails}
        />
      </MyModal>
      <div className="flex flex-row">
        <input
          type={isPassword ? "password" : undefined}
          name={label}
          style={{
            textAlign: centered || type === "number" ? "center" : undefined,
          }}
          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-teal-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          placeholder=" "
          pattern={pattern}
          required={!optional}
          value={value}
          onChange={(e) => onChangeCorrect(e.target.value)}
        />
        {type === "number" && !noCalc ? (
          <MyIcon icon="Calculate" onClick={() => setVisible1(true)} />
        ) : (
          <></>
        )}
      </div>
      <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-90 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[85%] peer-focus:-translate-y-6">
        {label}
      </label>
      <label className="block text-xs font-medium dark:text-white mb-3 text-red-600">
        {msg}
      </label>
    </div>
  );
};
