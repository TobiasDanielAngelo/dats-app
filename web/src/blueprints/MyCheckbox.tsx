import { MyIcon } from "./MyIcon";

export const MyCheckBox = (props: {
  hidden?: boolean;
  label?: string;
  value?: boolean;
  onChangeValue?: (val: boolean) => void;
  msg?: string;
}) => {
  const { hidden, label, value, msg, onChangeValue } = props;
  if (hidden) return null;

  return (
    <div className="flex flex-col items-left justify-start">
      <label className="text-xs text-blue-600">{label ?? "Select Items"}</label>
      <MyIcon
        icon={value ? "CheckBox" : "CheckBoxOutlineBlank"}
        onClick={() => onChangeValue?.(!value)}
        fontSize="large"
      />
      {msg && (
        <label className="block text-xs font-medium dark:text-white mt-1 text-red-600">
          {msg}
        </label>
      )}
    </div>
  );
};
