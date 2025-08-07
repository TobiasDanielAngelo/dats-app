import { useEffect, useState } from "react";
import type { Option } from "../constants/interfaces";
import { MyIcon } from "./MyIcon";

export const MyDropdownSelector = (props: {
  label?: string;
  options?: Option[];
  value?: number;
  onChangeValue: (t: number) => void;
  fetchFcn?: (t: string) => void;
  msg?: string;
}) => {
  const { label, options, onChangeValue, value, msg, fetchFcn } = props;

  const [isOption, setIsOption] = useState(true);
  const [search, setSearch] = useState("");

  const filteredOptions = options?.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      search !== "" && fetchFcn?.(search);
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="mb-0 flex flex-row items-center justify-center gap-2">
      {!isOption ? (
        <div className="relative flex-1">
          <label className="block text-xs font-medium dark:text-white md:mt-1 text-blue-600">
            {label}
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-teal-100 border border-teal-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          {search && !options?.map((s) => s.name).includes(search) && (
            <ul className="absolute flex-1 w-full z-50 border border-teal-400 dark:bg-gray-800 bg-teal-100 rounded-b-xl rounded-t-md">
              {filteredOptions?.map((opt) => (
                <li
                  key={opt.id}
                  onClick={() => {
                    onChangeValue(Number(opt.id));
                    setSearch(opt.name); // or "" if you want to reset
                  }}
                  className="text-sm z-49 cursor-pointer px-4 py-2 dark:text-white text-black rounded-md dark:hover:bg-gray-600 hover:bg-teal-200"
                >
                  {opt.name}
                </li>
              ))}
            </ul>
          )}
          <label className="block text-xs font-medium dark:text-white mb-3 text-red-600">
            {msg}
          </label>
        </div>
      ) : (
        <div className="flex-1">
          <label className="block text-xs font-medium dark:text-white md:mt-1 text-blue-600">
            {label}
          </label>
          <select
            value={value}
            onChange={(e) => onChangeValue(parseInt(e.target.value))}
            className="bg-teal-100 border border-teal-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value={undefined}>Select {label}</option>
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
      )}
      <MyIcon
        icon={isOption ? "Search" : "ViewList"}
        onClick={() => setIsOption((t) => !t)}
      />
    </div>
  );
};
