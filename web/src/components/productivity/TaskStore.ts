import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts, range, toOptions } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import { FREQ_CHOICES, WEEKDAY_CHOICES } from "./_AllChoices";

const { slug } = getPathParts("productivity", "Task");

export const TaskFields = {
  id: { field: "ID" },
  title: { field: "ShortCharField" },
  importance: { field: "LimitedDecimalField" },
  frequency: {
    field: "ChoiceIntegerField",
    choices: toOptions(FREQ_CHOICES),
    defaultValue: 3,
  },
  count: { field: "OptionalLimitedDecimalField" },
  interval: { field: "LimitedDecimalField" },
  startDate: { field: "DefaultTodayField" },
  startTime: { field: "OptionalLimitedTimeField" },
  endDate: { field: "OptionalDateField" },
  endTime: { field: "OptionalLimitedTimeField" },
  byWeekDay: {
    field: "ChoicesStringArrayField",
    choices: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((s) => ({
      id: s,
      name: s,
    })),
  },
  byMonthDay: {
    field: "ChoicesNumberArrayField",
    choices: range(1, 32).map((s) => ({ id: s, name: `${s}` })),
  },
  byMonth: {
    field: "ChoicesNumberArrayField",
    choices: range(1, 13).map((s) => ({ id: s, name: `${s}` })),
  },
  byYearDay: {
    field: "ChoicesNumberArrayField",
    choices: range(1, 367).map((s) => ({ id: s, name: `${s}` })),
  },
  byWeekNo: {
    field: "ChoicesNumberArrayField",
    choices: range(1, 54).map((s) => ({ id: s, name: `${s}` })),
  },
  byHour: {
    field: "ChoicesNumberArrayField",
    choices: range(0, 24).map((s) => ({ id: s, name: `${s}` })),
  },
  byMinute: {
    field: "ChoicesNumberArrayField",
    choices: range(0, 60).map((s) => ({ id: s, name: `${s}` })),
  },
  bySecond: {
    field: "ChoicesNumberArrayField",
    choices: range(0, 60).map((s) => ({ id: s, name: `${s}` })),
  },
  bySetPosition: {
    field: "ChoicesNumberArrayField",
    choices: range(-31, 32).map((s) => ({ id: s, name: `${s}` })),
  },
  weekStart: {
    field: "ChoiceIntegerField",
    choices: toOptions(WEEKDAY_CHOICES),
  },
  isArchived: { field: "DefaultBooleanField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(TaskFields);

export class Task extends MyModel(slug, props) {}
export class TaskStore extends MyStore(Task, BASE_URL, slug) {}
export type TaskInterface = PropsToInterface<typeof props>;
