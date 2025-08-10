import { useState, useRef, useEffect } from "react";
import type { Option } from "../constants/interfaces";
import { MyIcon } from "./MyIcon";

export const MyMultiDropdownSelector = (props: {
  label?: string;
  value: (number | string)[];
  onChangeValue: (t: (number | string)[]) => void;
  options?: Option[];
  msg?: string;
  relative?: boolean;
  open?: boolean;
  maxSelections?: number;
  fetchFcn?: (t: string) => void;
  isAll?: boolean;
}) => {
  const {
    label,
    options = [],
    onChangeValue,
    value = [],
    msg,
    relative,
    open,
    maxSelections,
    isAll,
    fetchFcn,
  } = props;
  const [isOpen, setOpen] = useState(open ?? false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectAll, setSelectAll] = useState(isAll);
  const [isOption, setIsOption] = useState(true);
  const [search, setSearch] = useState("");

  const filteredOptions = options?.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const onToggle = (id: number | string) => {
    if (value.includes(id)) {
      onChangeValue(value.filter((v) => v !== id));
    } else {
      if (!maxSelections || value.length < maxSelections) {
        onChangeValue([...value, id]);
      }
    }
  };

  useEffect(() => {
    onChangeValue(selectAll ? options.map((s) => s.id) : []);
  }, [selectAll, options.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      search !== "" && fetchFcn?.(`display_name__search=${search}`);
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchFcn?.("page=1");
  }, []);

  useEffect(() => {
    onChangeValue(
      selectAll ? options.map((s) => s.id) : value === null ? [] : value
    );
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="mb-3 relative" ref={dropdownRef}>
      <div className="flex-row flex justify-center items-center gap-2">
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
                      onToggle(opt.id);
                      setSearch(opt.name);
                    }}
                    className="text-sm z-49 cursor-pointer px-4 py-2 dark:text-white text-black rounded-md dark:hover:bg-gray-600 hover:bg-teal-200"
                  >
                    {opt.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex-1">
            {label && (
              <label className="block text-xs font-medium text-blue-600 dark:text-white mb-1">
                {label}
              </label>
            )}
            <div
              onClick={() => setOpen(!isOpen)}
              className="cursor-pointer border bg-teal-100 dark:bg-gray-800 dark:border-gray-600 border-teal-300 py-2 pl-2 rounded-lg text-sm text-gray-700 dark:text-white flex justify-between items-center"
            >
              <span className="truncate">
                {!value || value.length === 0
                  ? `Select ${label}`
                  : `${value.length} item${
                      value.length > 1 ? "s" : ""
                    } selected.`}
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-300 text-xs">
                <MyIcon icon="ExpandMore" fontSize={"small"} />
              </span>
            </div>
            {isOpen && (
              <div
                className="mt-1 absolute z-10 left-0 right-0 border rounded-lg bg-white dark:bg-gray-900 shadow-lg max-h-60 overflow-y-auto"
                style={{ position: relative ? "relative" : "absolute" }}
              >
                <label className="flex items-center gap-2 p-2 text-sm hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={() => setSelectAll((t) => !t)}
                    className="form-checkbox text-blue-500"
                  />
                  Select All
                </label>
                {options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 p-2 text-sm hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(opt.id)}
                      onChange={() => onToggle(opt.id)}
                      className="form-checkbox text-blue-500"
                    />
                    {opt.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        <MyIcon
          icon={isOption ? "Search" : "ViewList"}
          onClick={() => setIsOption((t) => !t)}
        />
      </div>
      <label className="block text-xs font-medium dark:text-white mb-3 text-red-600">
        {msg}
      </label>
    </div>
  );
};
