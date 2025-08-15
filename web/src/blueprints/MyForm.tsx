import { observer } from "mobx-react-lite";
import { DAYS_OF_WEEK_CHOICES } from "../constants/constants";
import { toOptions } from "../constants/helpers";
import { useKeyPress, useVisible, useWindowWidth } from "../constants/hooks";
import type { Field, KeyboardCodes } from "../constants/interfaces";
import {
  MyButton,
  MyCheckBox,
  MyColorPicker,
  MyConfirmModal,
  MyDateTimePicker,
  MyDropdownSelector,
  MyImageUploader,
  MyInput,
  MyMultiDropdownSelector,
  MyMultiSelector,
  MyTextArea,
  MyFileUploader,
} from "./";
import {} from "./MyFileUploader";
import { MyIcon } from "./MyIcon";

const getMsg = (msg: any, name: string) =>
  msg && !`${msg[name as keyof Object]}`.includes("undefined")
    ? `${msg[name as keyof Object]}`.includes("Invalid pk")
      ? "Select one that applies"
      : `${msg[name as keyof Object]}`
    : "";

const renderField = (
  t: Field,
  details: any,
  onChangeValue: any,
  msg: any,
  key: number
) => {
  const commonProps = {
    label: t.label,
    value: details[t.name],
    onChangeValue: (u: any) => onChangeValue(u, t.name),
    msg: getMsg(msg, t.name),
  };

  switch (t.type) {
    case "function":
      return (
        <div
          key={key}
          className="dark:text-white whitespace-pre-line items-center text-center"
        >
          <label className="block text-xs text-left font-medium md:mt-1 text-blue-600">
            {t.label}
          </label>
          {t.function?.(details)}
        </div>
      );
    case "password":
      return <MyInput key={key} {...commonProps} isPassword />;
    case "select":
      return (
        <MyDropdownSelector
          key={key}
          {...commonProps}
          fetchFcn={t.fetchFcn}
          searchFcn={t.searchFcn}
          options={t.options}
          onClickAdd={t.onClickAdd}
        />
      );
    case "date":
    case "time":
    case "datetime":
    case "month":
      return (
        <MyDateTimePicker
          {...commonProps}
          key={key}
          isDateOnly={t.type === "date" || t.type === "month"}
          dateFormat={t.type === "month" ? "MMM YYYY" : undefined}
          isTimeOnly={t.type === "time"}
        />
      );
    case "days":
      return (
        <MyMultiSelector
          key={key}
          {...commonProps}
          options={toOptions(DAYS_OF_WEEK_CHOICES)}
        />
      );
    case "multi":
      return (
        <MyMultiDropdownSelector
          key={key}
          {...commonProps}
          fetchFcn={t.fetchFcn}
          options={t.options}
          onClickAdd={t.onClickAdd}
        />
      );
    case "textarea":
      return (
        <MyTextArea
          key={key}
          {...commonProps}
          value={details[t.name] ?? ""}
          centered={t.centered}
        />
      );
    case "color":
      return <MyColorPicker key={key} {...commonProps} />;
    case "check":
      return <MyCheckBox key={key} {...commonProps} />;
    case "image":
      return (
        <MyImageUploader
          value={details[t.name]}
          onChangeValue={(u: any) => onChangeValue(u, t.name)}
          key={key}
        />
      );
    case "file":
      return (
        <MyFileUploader
          value={details[t.name]}
          onChangeValue={(u: any) => onChangeValue(u, t.name)}
          key={key}
        />
      );
    case "number":
    case "text":
      return (
        <MyInput
          key={key}
          {...commonProps}
          value={details[t.name] ?? ""}
          centered={t.centered}
          type={t.type}
        />
      );
    default:
      return (
        <div
          className="dark:text-gray-300 items-center justify-center"
          key={key}
        >
          {t.label}
        </div>
      );
  }
};

type FormProps = {
  fields: (Field | undefined)[][];
  title: string;
  objectName?: string;
  details: any;
  setDetails: (t: any) => void;
  onClickSubmit: () => void;
  onClickSubmitAdd?: () => void;
  hasDelete?: boolean;
  onDelete?: () => Promise<void>;
  msg?: Object;
  isLoading?: boolean;
};

export type MyFormProps<T extends Object & { id: number | null }> = {
  item?: T;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
};

export const MyForm = observer(
  ({
    fields,
    title,
    objectName,
    details,
    setDetails,
    onClickSubmit,
    onClickSubmitAdd,
    hasDelete,
    onDelete,
    msg,
    isLoading,
  }: FormProps) => {
    const hasTextarea = fields.some((row) =>
      row.some((field) => field?.type === "textarea")
    );

    const formHotKeys = (
      hasTextarea ? ["Shift", "Enter"] : ["Enter"]
    ) as KeyboardCodes[];

    useKeyPress(formHotKeys, onClickSubmit);
    const { isVisible1, setVisible1 } = useVisible();
    const width = useWindowWidth();

    const onChangeValue = (val: any, name: string) =>
      setDetails({ ...details, [name]: val });

    const onClickDelete = () => {
      setVisible1?.(true);
    };
    const onClickConfirm = async () => {
      await onDelete?.();
    };

    return (
      <div className="max-w-xl mx-auto p-10">
        <MyConfirmModal
          isVisible={isVisible1}
          setVisible={setVisible1}
          onClickCheck={onClickConfirm}
          objectName={objectName}
          actionName="Delete"
        />
        <h1 className="text-xl mb-2 font-bold leading-tight tracking-tight text-teal-900 md:text-2xl dark:text-white">
          {title}
        </h1>
        {fields.map((row, rowIdx) => (
          <div
            className="grid md:gap-6"
            key={rowIdx}
            style={{
              gridTemplateColumns: `repeat(${
                width > 800 ? row.length : 1
              }, minmax(0, 1fr))`,
            }}
          >
            {row.map((t, colIdx) =>
              t ? (
                renderField(t, details, onChangeValue, msg, colIdx)
              ) : (
                <div key={colIdx}></div>
              )
            )}
          </div>
        ))}
        <label className="block text-sm font-medium dark:text-white text-red-600">
          <div>{getMsg(msg, "nonFieldErrors")}</div>
          <div>{getMsg(msg, "detail")}</div>
        </label>
        <div className="flex flex-row-reverse justify-between items-center">
          <MyButton
            onClick={onClickSubmit}
            isLoading={isLoading}
            label="Save"
          />
          {!hasDelete ? (
            onClickSubmitAdd ? (
              <MyButton
                onClick={onClickSubmitAdd}
                isLoading={isLoading}
                label="Save and Add"
              />
            ) : (
              <></>
            )
          ) : (
            <MyIcon icon="Delete" fontSize="large" onClick={onClickDelete} />
          )}
        </div>
      </div>
    );
  }
);
