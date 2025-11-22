import { useState, useEffect } from "react";
import { MyIcon } from "./MyIcon";

export const MyDateTimePicker = (props: {
  value: string;
  label?: string;
  onChangeValue: (t: string) => void;
  isDateOnly?: boolean;
  isTimeOnly?: boolean;
  dateFormat?: string;
  msg?: string;
}) => {
  const { value, onChangeValue, isDateOnly, isTimeOnly, label, msg } = props;

  console.log(value);

  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");

  // Parse the incoming value and set local state
  useEffect(() => {
    if (!value) return;

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return;

      // Format date as YYYY-MM-DD for input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setDateValue(`${year}-${month}-${day}`);

      // Format time as HH:MM for input
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      setTimeValue(`${hours}:${minutes}`);
    } catch (e) {
      console.error("Invalid date value:", value);
    }
  }, [value]);

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate);
    updateValue(newDate, timeValue);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    updateValue(dateValue, newTime);
  };

  const updateValue = (d: string, t: string) => {
    if (isTimeOnly && t) {
      // For time only, use today's date with the selected time
      const today = new Date();
      const [hours, minutes] = t.split(":");
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChangeValue(today.toISOString());
    } else if (isDateOnly && d) {
      // For date only, set time to midnight
      const date = new Date(d + "T00:00:00");
      onChangeValue(date.toISOString());
    } else if (d && t) {
      // For both date and time
      const dateTime = new Date(`${d}T${t}:00`);
      onChangeValue(dateTime.toISOString());
    }
  };

  const handleSetNow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const newDate = `${year}-${month}-${day}`;
    const newTime = `${hours}:${minutes}`;

    setDateValue(newDate);
    setTimeValue(newTime);
    updateValue(newDate, newTime);
  };

  const getPlaceholder = () => {
    if (isTimeOnly) return "Select Time";
    if (isDateOnly) return "Select Date";
    return "Select Date/Time";
  };

  const getLabel = () => {
    if (label) return label;
    if (isTimeOnly) return "Select Time";
    if (isDateOnly) return "Select Date";
    return "Select Date/Time";
  };

  return (
    <div>
      <label className="text-xs text-blue-600">{getLabel()}</label>
      <div className="flex flex-row gap-2">
        <div className="flex-1 flex gap-2">
          {!isTimeOnly && (
            <input
              type="date"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              placeholder={getPlaceholder()}
              className="block pb-2.5 px-2 flex-1 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-teal-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
          )}
          {!isDateOnly && (
            <input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              placeholder={getPlaceholder()}
              className="block pb-2.5 px-2 flex-1 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-teal-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
          )}
        </div>
        <MyIcon icon="Today" onClick={handleSetNow} />
      </div>
      {msg && (
        <label className="block text-xs font-medium dark:text-white mb-3 text-red-600">
          {msg}
        </label>
      )}
    </div>
  );
};
