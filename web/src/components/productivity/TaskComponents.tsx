// TaskComponents.tsx
import { range } from "lodash";
import { useMemo } from "react";
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import {
  generateCollidingDates,
  generateScheduleDefinition,
  getPathParts,
  toOptions,
} from "../../constants/helpers";
import { Field } from "../../constants/interfaces";
import { formatValue } from "../../constants/JSXHelpers";
import { useStore } from "../core/Store";
import { FREQ_CHOICES, WEEKDAY_CHOICES } from "./_AllChoices";
import { Task, TaskFields } from "./TaskStore";

export const TaskForm = (props: MyGenericForm<Task>) => {
  const { item, setVisible, fetchFcn, title } = props;
  const modelNameParts = getPathParts("productivity", "Task");
  const store = useStore();
  const { productivityStore } = store;

  const fields = useMemo(
    () =>
      [
        [
          { name: "title", label: "Task Name", type: "text" },
          { name: "count", label: "Count", type: "text" },
        ],
        [
          {
            name: "frequency",
            label: "Frequency",
            type: "select",
            options: toOptions(FREQ_CHOICES),
          },
          { name: "interval", label: "Interval", type: "text" },
          {
            name: "weekStart",
            label: "Week Start",
            type: "select",
            options: toOptions(WEEKDAY_CHOICES),
          },
        ],
        [
          {
            name: "byWeekDay",
            label: "By Week Day",
            type: "multi",
            options: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((s) => ({
              id: s,
              name: s,
            })),
          },
          {
            name: "byMonthDay",
            label: "By Month Day",
            type: "multi",
            options: range(1, 32).map((s) => ({ id: s, name: `${s}` })),
          },
          {
            name: "byYearDay",
            label: "By Year Day",
            type: "multi",
            options: range(1, 367).map((s) => ({ id: s, name: `${s}` })),
          },
        ],
        [
          {
            name: "byMonth",
            label: "By Month #",
            type: "multi",
            options: range(1, 13).map((s) => ({ id: s, name: `${s}` })),
          },
          {
            name: "byWeekNo",
            label: "By Week #",
            type: "multi",
            options: range(1, 54).map((s) => ({ id: s, name: `${s}` })),
          },
          {
            name: "bySetPosition",
            label: "By Set Position",
            type: "multi",
            options: range(-31, 32).map((s) => ({ id: s, name: `${s}` })),
          },
        ],
        [
          {
            name: "byHour",
            label: "By Hour",
            type: "multi",
            options: range(0, 24).map((s) => ({ id: s, name: `${s}` })),
          },

          {
            name: "byMinute",
            label: "By Minute",
            type: "multi",
            options: range(0, 60).map((s) => ({ id: s, name: `${s}` })),
          },

          {
            name: "bySecond",
            label: "By Second",
            type: "multi",
            options: range(0, 60).map((s) => ({ id: s, name: `${s}` })),
          },
        ],
        [
          { name: "startDate", label: "Start Date", type: "date" },
          { name: "startTime", label: "Start Time", type: "time" },
        ],
        [
          { name: "endDate", label: "End Date", type: "date" },
          { name: "endTime", label: "End Time", type: "time" },
        ],
        [
          {
            name: "scheduleDefinitions",
            label: "Schedule Definition",
            type: "function",
            function: (t) => generateScheduleDefinition(t),
          },
        ],
        [
          {
            name: "collidings",
            label: "Colliding Dates",
            type: "function",
            function: (t: any) =>
              formatValue(
                generateCollidingDates(t),
                "",
                [],
                undefined,
                isNaN(parseInt(t.count))
              ),
          },
        ],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm
      item={item}
      fields={fields}
      objectName={modelNameParts.titleCase}
      store={productivityStore.taskStore}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      title={title}
    />
  );
};

const TaskCalendar = () => {
  return <></>;
};

export const TaskComponents = MyGenericComponents(
  Task,
  TaskFields,
  getPathParts("productivity", "Task"),
  <TaskCalendar />,
  undefined,
  undefined,
  { Form: TaskForm }
);
