export const MyColorPicker = (props: {
  hidden?: boolean;
  label?: string;
  value?: string;
  onChangeValue?: (t: string) => void;
  msg?: string;
}) => {
  const { hidden, label, msg, value, onChangeValue } = props;

  return hidden ? (
    <></>
  ) : (
    <div className="relative z-0 w-full mt-3 group">
      <input
        name={label}
        className="text-center block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-teal-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        placeholder="Color"
        value={value}
        onChange={(e) => onChangeValue?.(e.target.value)}
      />

      <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-90 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[85%] peer-focus:-translate-y-6">
        {label}
      </label>
      <label className="block text-xs font-medium dark:text-white mb-3 text-red-600">
        {msg}
      </label>
    </div>
  );
};
