import type { Option } from "../constants/interfaces";

export const MyMultiSelector = (props: {
  label?: string;
  value: (number | string)[];
  onChangeValue: (t: (number | string)[]) => void;
  options?: Option[];
  msg?: string;
}) => {
  const { label, value, onChangeValue, options, msg } = props;

  const onClickItem = (t: number | string) => {
    onChangeValue(
      value.includes(t) ? value.filter((s) => s !== t) : [...value, t]
    );
  };

  return (
    <div>
      <label className="text-xs text-blue-600">{label ?? "Select Items"}</label>
      <div className="flex flex-row justify-evenly items-center py-2">
        {options?.map((s) => (
          <div
            key={s.id}
            className={
              value.includes(s.id)
                ? "cursor-pointer text-blue-600 font-bold"
                : "cursor-pointer text-gray-400"
            }
            onClick={() => onClickItem(s.id)}
          >
            {s.name}
          </div>
        ))}
      </div>
      <label className="block text-xs font-medium dark:text-white mb-3 text-red-600">
        {msg}
      </label>
    </div>
  );
};
