import { type Option } from "../constants/interfaces";

export const MySearchDropdownSelector = (props: {
  label?: string;
  options?: Option[];
  value?: number;
  onChangeValue: (t: number) => void;
  msg?: string;
}) => {
  const { label, options, onChangeValue, value, msg } = props;
  return (
    <div>
      <label className="block text-xs font-medium dark:text-white mt-3 text-blue-600">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChangeValue(parseInt(e.target.value))}
        className="bg-gray-50 border border-teal-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value={-1}>Select an Item</option>
        {options?.map((s, ind) => (
          <option key={ind} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <label className="block text-xs font-medium dark:text-white mb-3 text-red-600">
        {msg}
      </label>
    </div>
  );
};
