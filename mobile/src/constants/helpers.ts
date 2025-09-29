import { format, isValid, parse } from "date-fns";
import LZString from "lz-string";
import moment from "moment";
import { type Options, RRule, Weekday } from "rrule";
import type { Option, Page, ScheduleInterface, ViewPath } from "./interfaces";
import { pluralize } from "inflection";
import { LetterWeightKey, letterWeights, winWidth } from "./constants";

export const posRamp = (x: number) => (x > 0 ? x : 0);

export function kebabToCamel(str: string) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

export function getKeyByValue(obj: object, value: number): string | undefined {
  return Object.keys(obj).find((key) => obj[key as keyof typeof obj] === value);
}

export function prettifyJSON(str: string): string {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2); // 2-space indent
  } catch {
    return str; // or throw an error, or return '', up to you
  }
}

export function titleToCamel(str: string) {
  return str
    .toLowerCase()
    .replace(/(?:^\w|[\s-]\w)/g, (match, offset) =>
      offset === 0 ? match.toLowerCase() : match.trim().toUpperCase()
    )
    .replace(/\s+/g, "");
}

export const getOrdinal = (n: number) => {
  let ord = "th";

  if (n % 10 == 1 && n % 100 != 11) {
    ord = "st";
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = "nd";
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = "rd";
  }
  return ord;
};

export function getOrdinalName(n: number): string {
  const abs = Math.abs(n);
  let suffix = "th";
  if (abs % 10 === 1 && abs % 100 !== 11) suffix = "st";
  else if (abs % 10 === 2 && abs % 100 !== 12) suffix = "nd";
  else if (abs % 10 === 3 && abs % 100 !== 13) suffix = "rd";

  if (n === -1) return "last";
  if (n < -1) return `${abs}${suffix} last`;
  return `${abs}${suffix}`;
}

export function toMoneyShortened(val: number) {
  const value = Math.abs(val);
  const negative = val < 0;
  if (value < 1000)
    return `\u20b1${
      negative ? "(" + value.toFixed(2) + ")" : value.toFixed(2)
    }`; // If the value is less than 1000, no need for formatting

  const suffixes = ["", "K", "M", "B", "T"]; // Suffixes for thousands, millions, billions, etc.
  const magnitude = Math.floor(Math.log10(value) / 3); // Determine the magnitude (thousands, millions, etc.)

  const shortValue = value / Math.pow(1000, magnitude); // Scale the number by the appropriate power of 1000
  const formattedValue = `${(Math.round(shortValue * 10) / 10).toFixed(1)}${
    suffixes[magnitude]
  }`; // Round to one decimal place and add suffix

  return `\u20b1${negative ? "(" + formattedValue + ")" : formattedValue}`;
}

/**
 * Replaces multiple substrings in a string with a given replacement.
 * Returns '-' if the final string is empty or only whitespace.
 *
 * @param {string} str - The input string.
 * @param {string[]} find - Array of substrings to replace.
 * @param {string} replace - Replacement string.
 * @returns {string} - Modified string or '-' if empty.
 *
 * @example
 * replaceCumulative("Hello, World!", [",", "!"], ""); // "Hello World"
 * replaceCumulative("   ", [" "], "");                // "-"
 */
export const replaceCumulative = (
  str: string,
  find: string[],
  replace: string
): string => {
  for (var i = 0; i < find.length; i++)
    str = str.replace(new RegExp(find[i], "g"), replace);
  return str.replace(/\s/g, "") !== "" ? str : "-";
};

export const getDateFromSched = (date: Date, sched: number) => {
  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    Math.min(sched, lastDayOfMonth)
  );
};

export const isSchedIncluded = (dates: Date[], sched: number) => {
  const lastDayOfMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const day28 = dates.find((s) => s.getDate() === 28);
  return sched <= 28
    ? dates.map((s) => s.getDate()).includes(sched)
    : sched <= 31
    ? !!day28 && lastDayOfMonth(day28.getFullYear(), day28.getMonth()) <= sched
    : sched === 32
    ? !!day28 &&
      dates
        .map((s) => s.getDate())
        .includes(lastDayOfMonth(day28.getFullYear(), day28.getMonth()))
    : true;
};

export const scheduledAmount = (
  amount: number,
  dates: Date[],
  schedule: number
) => {
  return isSchedIncluded(dates, schedule) ? amount : 0;
};

export const areArraysIdentical = (arr1: string[], arr2: string[]) =>
  arr2.every((v) => arr1.includes(v)) && arr1.every((v) => arr2.includes(v));

export const isSubset = (smallArr: string[], largeArr: string[]) => {
  return smallArr.every((t) => largeArr.includes(t));
};

export const addDays = (date: Date, days: number) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const timeDifferenceTime = (startTime: string, endTime: string) => {
  let start = new Date(moment(startTime, "hh:mm A").toISOString());
  let end = new Date(moment(endTime, "hh:mm A").toISOString());

  return end.getTime() > start.getTime()
    ? (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    : 0;
};

/**
 * Sorts an array of objects by a specified key (assumed to be a date or date-like string).
 *
 * @template T - The type of objects in the array.
 * @param {T[]} arr - The array to sort.
 * @param {keyof T} keyName - The key to sort by.
 * @param {boolean} [decreasing=false] - Whether to sort in descending order.
 * @returns {T[]} - A new sorted array.
 *
 * @example
 * sortByKey(users, "createdAt", true); // Sorts users by createdAt descending
 */
export const sortByKey = <T>(
  arr: T[],
  keyName: keyof T,
  decreasing: boolean = false
): T[] => {
  return arr.slice().sort((a, b) => {
    const aVal = a[keyName];
    const bVal = b[keyName];

    if (typeof aVal === "string") {
      return (decreasing ? 1 : -1) * (bVal > aVal ? 1 : -1);
    }

    const dateA = new Date(aVal as any);
    const dateB = new Date(bVal as any);

    return decreasing
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });
};

/**
 * Converts an array of strings or objects into a standardized `Option[]` format.
 *
 * @template T - The item type (string or object).
 * @param {T[]} items - The input array.
 * @param {keyof T} [keyName] - The key to use as display name (only for object items).
 * @returns {Option[]} - Array of options with `id` and `name`.
 *
 * @example
 * toOptions(["Red", "Green"]);
 * // [{ id: 0, name: "Red" }, { id: 1, name: "Green" }]
 *
 * toOptions(users, "username");
 * // [{ id: 1, name: "johndoe" }, ...]
 */
export const toOptions = <T>(
  items: T[],
  keyName?: keyof T | (keyof T)[]
): Option[] => {
  return items.map((item, index) => {
    if (typeof item === "string") {
      return { id: index, name: item };
    } else {
      const obj = item as Record<string, any>;
      const getValue = (key: keyof T) => {
        const val = obj[key as string];
        if (typeof val === "boolean") {
          return val ? String(key) : "";
        }
        return val ?? "";
      };
      const name = Array.isArray(keyName)
        ? keyName.map(getValue).filter(Boolean).join(" ")
        : keyName
        ? getValue(keyName)
        : "";
      return {
        id: obj.id ?? index,
        name,
      };
    }
  });
};

export const timeDifference = (start: Date | string, end?: Date | string) => {
  let td = new Date(end ?? "").getTime() - new Date(start).getTime();
  return moment(new Date(td)).utc(false).format("H[h] mm[m]");
};

/**
 * Converts a string to Title Case, preserving acronyms and numbers.
 *
 * @param {string} [str] - The input string.
 * @returns {string} - The title-cased string.
 *
 * @example
 * toTitleCase("helloWorld")        // "Hello World"
 * toTitleCase("myURL123value")     // "My URL 123 Value"
 * toTitleCase("user_id")           // "User Id"
 * toTitleCase("")                  // ""
 */
export const toTitleCase = (str?: string): string => {
  return str
    ? str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+|\b)|[A-Z]?[a-z]+|[0-9]+|[A-Z]/g)
        ?.map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        .join(" ") ?? ""
    : "";
};

export const toMoney = (n?: any) => {
  if (isNaN(n)) return "";
  if (!isFinite(n)) return "\u221e";
  return (
    `\u20b1` +
    (!n
      ? ` —`
      : n > 0
      ? n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : "(" +
        Math.abs(n)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        ")")
  );
};

export const toHours = (n?: any) => {
  if (isNaN(n)) return ` \u2013`;
  if (!isFinite(n)) return "\u221e";
  return !n
    ? ` \u2013`
    : `${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}h`;
};

export const hoursToWorkDays = (n: number, hoursPerDay?: number) => {
  if (isNaN(n)) return ` \u2013`;
  if (!isFinite(n)) return "\u221e";
  return !n
    ? ` \u2013`
    : `${(n / (hoursPerDay ?? 24))
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} work days`;
};

export const handleKeyDown = (
  e: KeyboardEvent,
  keys: string[],
  callback?: () => void
) => {
  if (keys.includes(e.key)) callback?.();
};

export const rounded = (t: number, numDigits?: number) =>
  Math.round(t * 10 ** (numDigits ?? 2)) / 10 ** (numDigits ?? 2);

export const mySum = (numArr?: number[]) => {
  return numArr?.reduce((a, b) => a + b, 0) ?? 0;
};

export const myProduct = (t: number[]) => rounded(t.reduce((a, b) => a * b, 1));

export const camelCaseToWords = (s: string) => {
  const result = s.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const camelToSnakeCase = (str: string, dunder?: boolean) => {
  const matches = [...str.matchAll(/[A-Z]/g)];
  if (!matches.length) return str;

  return str.replace(/[A-Z]/g, (letter, index) => {
    const isLast = matches[matches.length - 1].index === index;
    return `${dunder && isLast ? "__" : "_"}${letter.toLowerCase()}`;
  });
};

export const createArrayFromN = (n: number) => {
  return Array.from(Array(n).keys());
};

export const getDatesFromSched = (
  dateStart: Date,
  sched: number,
  count: number,
  frequency: number
) => {
  return createArrayFromN(count).map((s) => {
    let date = new Date(dateStart);
    date.setMonth(date.getMonth() + s * frequency);
    date.setDate(
      Math.min(
        sched,
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      )
    );
    return date;
  });
};

/**
 * Returns the intersection of two string arrays.
 *
 * @param {string[]} arr1 - First array of strings.
 * @param {string[]} arr2 - Second array of strings.
 * @returns {string[]} - Array of common strings found in both arrays.
 */
export const intersectionArrStrs = (
  arr1: string[],
  arr2: string[]
): string[] => {
  const setA = new Set(arr1);
  return arr2.filter((value) => setA.has(value));
};

/**
 * Checks if all parts of the query exist in the target string (case-insensitive).
 *
 * @param {string} str - The target string to search in.
 * @param {string} query - The search query, split by spaces or commas.
 * @returns {boolean} - True if all query parts are found in the string.
 */

export const isQueryMatch = (str: string, query: string): boolean => {
  return query
    .split(/[ ,]+/)
    .every((v) => str.toLowerCase().includes(v.toLowerCase()));
};

export const setBlankIfNeg1 = (str: string, val: number) => {
  return val === -1 ? str : "";
};

export const cmToPx = (cm: number) => cm / 0.026458;

export const getFirstWords = (str: string, len = 1) => {
  const words = str.trim().split(/[\s,–—-]+/);
  return words.length > len ? words.slice(0, len).join(" ") + "..." : str;
};

export const isDatetimeValue = (val: any) => {
  if (val instanceof Date && !isNaN(val.getTime())) return true;
  if (typeof val !== "string") return false;
  const parsed = Date.parse(val);
  // Ensure it's a valid date and includes time components
  return (
    !isNaN(parsed) && /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(val) // date + time format
  );
};

export const isDateValue = (val: any) => {
  if (val instanceof Date && !isNaN(val.getTime())) return true;
  if (typeof val !== "string") return false;
  const parsed = Date.parse(val);
  return (
    !isNaN(parsed) && /^\d{4}-\d{2}-\d{2}$/.test(val) // exact date format: YYYY-MM-DD
  );
};

/**
 * Creates a string signature from selected keys of an object.
 *
 * @template T - The object type.
 * @param {T} model - The object to extract values from.
 * @param {(keyof T)[]} keys - Keys whose values will form the signature.
 * @returns {string} - A pipe-separated string of the selected values.
 */
export function getModelSignature<T extends { [key: string]: any }>(
  model: T,
  keys: (keyof T)[]
): string {
  return keys.map((key) => String(model[key])).join("|");
}

export function getStoreSignature<T extends Record<string, any>>(
  items: T[]
): string {
  return items
    .map((item) =>
      Object.keys(item)
        .map((key) => String(item[key as keyof T]))
        .join("|")
    )
    .join("::");
}

/**
 * Cleans a string by replacing all non-alphanumeric characters with spaces.
 *
 * @param {string} input - The string to clean.
 * @returns {string} - The cleaned string with only letters, numbers, and spaces.
 */
export const cleanText = (input: string) => {
  return input.replace(/[^a-zA-Z0-9]+/g, " ");
};

/**
 * Compresses an object into a URI-safe, short string using LZString.
 *
 * @param {object} data - The data object to compress.
 * @returns {string} - A URI-safe compressed string.
 */
export const generateShortParam = (data: object) => {
  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
};

/**
 * Decompresses and parses a URI-safe compressed string into an object.
 *
 * @param {string | null} param - The compressed string.
 * @returns {Record<string, any>} - The decompressed object, or empty object on error.
 */
export const decodeShortParam = (param: string | null): Record<string, any> => {
  try {
    if (!param || typeof param !== "string") throw new Error("Invalid param");

    const json = LZString.decompressFromEncodedURIComponent(param);
    return json ? JSON.parse(json) : {};
  } catch (e) {
    console.error("Decoding failed:", e);
    return {};
  }
};

export const months = [
  { short: "Jan", long: "January" },
  { short: "Feb", long: "February" },
  { short: "Mar", long: "March" },
  { short: "Apr", long: "April" },
  { short: "May", long: "May" },
  { short: "Jun", long: "June" },
  { short: "Jul", long: "July" },
  { short: "Aug", long: "August" },
  { short: "Sep", long: "September" },
  { short: "Oct", long: "October" },
  { short: "Nov", long: "November" },
  { short: "Dec", long: "December" },
];

/**
 * Returns the month name based on a month index (0–11).
 *
 * @param {number} monthNum - The month index (0 = January, 11 = December).
 * @param {"short" | "long"} [type="short"] - Format of the month name.
 * @returns {string} - The corresponding month name or "Invalid" if out of range.
 */
export function getMonthName(
  monthNum: number,
  type: "short" | "long" = "short"
): string {
  const index = monthNum;
  if (index < 0 || index > 11) return "Invalid";
  return months[index][type];
}

/**
 * Extracts unique, non-null numeric values from a specified key in an array of objects.
 *
 * @template T - The object type in the array.
 * @template K - The key of T to extract values from.
 * @param {T[]} data - Array of objects to extract from.
 * @param {K} key - The key whose values will be collected.
 * @returns {number[]} - An array of unique numeric values (excluding undefined/null).
 */
export const getUniqueIdsFromFK = <T, K extends keyof T>(
  data: T[],
  key: K
): number[] => {
  return Array.from(new Set(data.map((item) => item[key] ?? -1))).filter(
    (id) => id !== -1
  ) as (T[K] extends number ? number : never)[];
};

/**
 * Generates a 10-character alphanumeric ID based on the current timestamp and random data.
 * - Uses base36 to keep it compact.
 * - Ensures uniqueness across time and multiple calls.
 */
export function generateShortId(): string {
  const timePart = Date.now().toString(36); // base36 = time-encoded
  const randomPart = Math.random().toString(36).substring(2, 10); // remove "0."
  return (timePart + randomPart).substring(0, 10); // combine & trim to 10 chars
}

export function sortAndFilterByIds<T>(
  items: T[],
  ids: (number | string)[],
  getId: (item: T) => number | string
): T[] {
  return items
    .filter((item) => ids.includes(getId(item)))
    .sort((a, b) => ids.indexOf(getId(a)) - ids.indexOf(getId(b)));
}

export const getDescendantIds = (
  allGoals: { parentGoal: number | string; id: number | string }[],
  goalId?: number | string
): (number | string)[] => {
  const directChildren = allGoals
    .filter((g) => g.parentGoal === goalId)
    .map((s) => s.id) as (number | string)[];
  const allDescendants = directChildren.flatMap((c) =>
    getDescendantIds(allGoals, c)
  );
  return [...directChildren, ...allDescendants];
};

const WEEKDAY_MAP: Record<string, Weekday> = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
};

export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) =>
        v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
    )
  ) as Partial<T>;
}

/**
 * Converts a local date to a UTC-equivalent Date for RRULE processing.
 * Adjusts by the local timezone offset.
 */
export const toUTCForRRule = (date: Date | string | null): Date | null =>
  !date
    ? null
    : moment(new Date(date))
        .add(-new Date().getTimezoneOffset(), "minutes")
        .toDate();

function normalizeDate(dateStr: string | null | Date | undefined): string {
  if (typeof dateStr !== "string") {
    return format(dateStr as Date, "yyyy-MM-dd");
  }
  const formats = ["MMM d, yyyy", "yyyy-MM-dd"];
  for (const fmt of formats) {
    const parsed = parse(dateStr, fmt, new Date());
    if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
  }
  try {
    return dateStr;
  } catch (_) {
    return "";
  }
}

function normalizeTime(timeStr: string | null | Date | undefined): string {
  if (typeof timeStr !== "string") {
    return format(timeStr as Date, "HH:mm:ss");
  }
  const formats = ["h:mm a", "HH:mm:ss"];
  for (const fmt of formats) {
    const parsed = parse(timeStr, fmt, new Date());
    if (isValid(parsed)) return format(parsed, "HH:mm:ss");
  }
  try {
    return format(timeStr, "HH:mm:ss");
  } catch (_) {
    return "";
  }
}

export function isValidRRuleOptions(options: Partial<Options>): boolean {
  const allowedFreq = [0, 1, 2, 3, 4, 5, 6]; // YEARLY to SECONDLY

  if (!options) return false;

  // FREQ is required
  if (typeof options.freq !== "number" || !allowedFreq.includes(options.freq)) {
    console.warn("Freq issue");
    return false;
  }

  // DTSTART must be a valid Date
  if (!(options.dtstart instanceof Date) || isNaN(options.dtstart.getTime())) {
    console.warn("DTstart issue");
    return false;
  }

  // INTERVAL must be a positive number (optional)
  if (
    options.interval &&
    (!Number.isInteger(options.interval) || options.interval <= 0)
  ) {
    console.warn("Interval issue");
    return false;
  }

  // COUNT must be a positive integer (optional)
  if (
    options.count &&
    (!Number.isInteger(options.count) || options.count <= 0)
  ) {
    console.warn("Count issue");
    return false;
  }

  // UNTIL must be a valid Date (optional)
  if (
    options.until &&
    (!(options.until instanceof Date) || isNaN(options.until.getTime()))
  ) {
    console.warn("Until issue");
    return false;
  }

  return true;
}

/**
 * Converts a UTC date from RRULE back to local time.
 * Adjusts by adding the local timezone offset.
 */
export const fromUTCForRRule = (date: Date | string): Date =>
  moment(new Date(date))
    .add(new Date().getTimezoneOffset(), "minutes")
    .toDate();

export function buildRRule(schedule: ScheduleInterface): RRule | null {
  const startDate = schedule.startDate;
  const startTime =
    schedule.startTime && schedule.startTime?.length
      ? schedule.startTime
      : "12:00 AM";
  const endDate = schedule.endDate;
  const endTime =
    schedule.endTime && schedule.endTime?.length
      ? schedule.endTime
      : "11:59 PM";

  const start = !startDate
    ? null
    : `${normalizeDate(startDate)}T${normalizeTime(startTime)}`;

  const end = !endDate
    ? null
    : `${normalizeDate(endDate)}T${normalizeTime(endTime)}`;

  const ruleOptions = {
    freq: schedule.freq ?? RRule.DAILY,
    interval: Number(schedule.interval) || 1,
    byweekday: schedule.byWeekDay
      ?.map((d) => WEEKDAY_MAP[d])
      .filter(Boolean) as Weekday[],
    bymonth: schedule.byMonth?.map(Number) ?? undefined,
    bymonthday: schedule.byMonthDay?.map(Number) ?? undefined,
    byyearday: schedule.byYearDay?.map(Number) ?? undefined,
    byweekno: schedule.byWeekNo?.map(Number) ?? undefined,
    byhour: schedule.byHour?.map(Number) ?? undefined,
    byminute: schedule.byMinute?.map(Number) ?? undefined,
    bysecond: schedule.bySecond?.map(Number) ?? undefined,
    bysetpos: schedule.bySetPosition?.map(Number) ?? undefined,
    count: Number(schedule.count) === 0 ? undefined : Number(schedule.count),
    dtstart: toUTCForRRule(start),
    until: toUTCForRRule(end),
  };

  if (!isValidRRuleOptions(ruleOptions)) {
    return null;
  }

  try {
    const rule = new RRule(cleanObject(ruleOptions) as Options);
    return rule;
  } catch (e) {
    console.error("Failed to build RRule:", e, ruleOptions);
    return null;
  }
}

export function generateCollidingDates(
  sched: ScheduleInterface,
  window?: { startDate: Date; endDate: Date }
): Date[] {
  const schedule = sched;
  const rule = buildRRule(schedule);
  if (!rule) return [];

  return window
    ? rule
        .between(
          toUTCForRRule(window.startDate) ?? new Date(),
          toUTCForRRule(window.endDate) ?? new Date()
        )
        .map(fromUTCForRRule)
    : sched.count
    ? rule.all().map(fromUTCForRRule)
    : new RRule({ ...rule.options, count: 5 }).all().map(fromUTCForRRule);
}

export function rruleToDetailedText(rule: RRule): string {
  const options = rule.options;

  const freqMap = {
    [RRule.DAILY]: "Daily",
    [RRule.WEEKLY]: "Weekly",
    [RRule.MONTHLY]: "Monthly",
    [RRule.YEARLY]: "Yearly",
    [RRule.HOURLY]: "Hourly",
    [RRule.MINUTELY]: "Every minute",
    [RRule.SECONDLY]: "Every second",
  };

  const weekdayMap: Record<number, string> = {
    0: "Mondays",
    1: "Tuesdays",
    2: "Wednesdays",
    3: "Thursdays",
    4: "Fridays",
    5: "Saturdays",
    6: "Sundays",
  };

  const monthMap = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const freqLabel = freqMap[options.freq] || "Repeats";

  const byDay =
    options.byweekday?.length > 0
      ? options.byweekday
          .map((d) => weekdayMap[d as keyof typeof weekdayMap] || d.toString())
          .join(", ")
      : null;

  const byMonthDay = options.bymonthday?.length
    ? "on the " +
      options.bymonthday.map((t) => `${t}${getOrdinal(t)}`).join(", ") +
      " day"
    : null;

  const byYearDay = options.byyearday?.length
    ? "on day " + options.byyearday.join(", ") + " of the year"
    : null;

  const byWeekNo = options.byweekno?.length
    ? "on week " + options.byweekno.join(", ")
    : null;

  const byMonth = options.bymonth?.length
    ? "in " + options.bymonth.map((m) => monthMap[m] || `Month ${m}`).join(", ")
    : null;

  const hours = options.byhour || [];
  const minutes = options.byminute || [0];
  const bySetPos = options.bysetpos || [];

  const times: string[] = [];
  for (const hour of hours) {
    for (const minute of minutes) {
      const timeStr = moment({ hour, minute }).format("h:mm A");
      times.push(timeStr);
    }
  }

  const byTime = times.length > 0 ? `at ${times.join(", ")}` : null;

  const interval =
    options.interval > 1
      ? `Every ${options.interval} ${
          freqLabel.toLowerCase() === "daily"
            ? "days"
            : freqLabel.toLowerCase().replace("ly", "") + "s"
        }`
      : freqLabel;

  const parts: string[] = [];

  if (interval) parts.push(interval);
  if (byDay) {
    if (bySetPos.length > 0) {
      parts.push(`on the ${bySetPos.map(getOrdinalName).join(", ")} ${byDay}`);
    } else {
      parts.push("on " + byDay);
    }
  }
  if (byWeekNo) parts.push(byWeekNo);
  if (byMonthDay) parts.push(byMonthDay);
  if (byYearDay) parts.push(byYearDay);
  if (byMonth) parts.push(byMonth);
  if (byTime) parts.push(byTime);
  if (options.count) {
    parts.push(`for ${options.count} time${options.count > 1 ? "s" : ""}`);
  } else {
    parts.push(`indefinitely`);
  }

  if (options.dtstart) {
    parts.push(`[ ${moment(options.dtstart).format("MMM D, YYYY")} -`);
  }
  if (options.until) {
    parts.push(`until ${moment(options.until).format("MMM D, YYYY")} ]`);
  } else {
    parts.push(`]`);
  }

  return parts.join(" ");
}

export function generateScheduleDefinition(sched: ScheduleInterface): string {
  const schedule = sched;
  const rule = buildRRule(schedule);
  if (!rule) return "";

  return rruleToDetailedText(rule);
}

export function range(a: number, b: number): number[] {
  return Array.from({ length: b - a }, (_, i) => i + a);
}

export function toRoman(num: number): string {
  const map: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";
  for (const [val, roman] of map) {
    while (num >= val) {
      result += roman;
      num -= val;
    }
  }
  return result;
}

export function findByIndex<T>(arr: T[], index: number): T | undefined {
  return arr[index];
}

export function toSuperscript(n: number | string): string {
  const map: { [k: string]: string } = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    I: "ᴵ",
    V: "ⱽ",
    X: "ˣ",
    L: "ᴸ",
    C: "ᶜ",
    D: "ᴰ",
    M: "ᴹ",
  };
  return String(n)
    .split("")
    .map((c) => map[c] || "")
    .join("");
}

export function toRomanWithExponents(number: number): string {
  const chunks: string[] = [];
  let num = Math.abs(number);
  const sign = number < 0;

  const powers = [
    [1_000_000_000, 4],
    [1_000_000, 3],
    [1000, 2],
  ];

  for (const [divisor, exp] of powers) {
    const part = Math.floor(num / divisor);
    if (part > 0) {
      chunks.push(`${toRoman(part)}M${toSuperscript(toRoman(exp))}`);
      num %= divisor;
    }
  }

  if (num > 0) chunks.push(toRoman(num));

  return `${sign ? "[" : ""}${chunks.join(" ")}${sign ? "]" : ""}`;
}

export const getPathParts = (folder: string, rawName: string) => {
  const words = rawName.match(/[A-Z][a-z]+|[a-z]+/g) || [""];

  const kebabCase = words.map((w) => w.toLowerCase()).join("-");
  const kebabCasePlural = pluralize(kebabCase);

  const titleCase = words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const titleCasePlural = pluralize(titleCase);

  const camelCase = [
    words[0].toLowerCase(),
    ...words.slice(1).map((w) => w[0].toUpperCase() + w.slice(1)),
  ].join("");

  return {
    slug: `${folder}/${kebabCasePlural}/`,
    folder,
    rawName,
    kebabCase,
    kebabCasePlural,
    titleCase,
    titleCasePlural,
    camelCase,
  };
};

export type PathParts = ReturnType<typeof getPathParts>;

const toKebab = (str: string) =>
  str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

export function buildRoutes(obj: any, basePath = "") {
  const routes: { path: string; component: any }[] = [];

  for (const key in obj) {
    const value = obj[key];
    const newPath = `${basePath}/${toKebab(key)}`;

    if (typeof value === "function" || "$$typeof" in value) {
      // Direct React component → use basePath as route
      routes.push({ path: basePath, component: value });
    } else if (typeof value === "object") {
      // If object contains a View key, use it directly
      if (
        "TheView" in value &&
        (typeof value.TheView === "function" || "$$typeof" in value.TheView)
      ) {
        routes.push({ path: newPath, component: value.TheView });
      } else {
        routes.push(...buildRoutes(value, newPath));
      }
    }
  }

  return routes;
}

export function buildViewPaths(obj: any, hiddenModule?: string[]): ViewPath[] {
  const viewPaths: ViewPath[] = [];

  for (const moduleName in obj) {
    if (hiddenModule?.includes(moduleName)) continue;
    const moduleValue = obj[moduleName];
    const subKeys = Object.keys(moduleValue);

    // Case 1: Top-level has direct View
    if ("View" in moduleValue) {
      viewPaths.push({
        title: moduleName,
        items: [],
        mainLink: `/${moduleName.toLowerCase()}`,
      });
    }
    // Case 2: Top-level has submodules
    else {
      const items: string[] = [];
      for (const subName of subKeys) {
        items.push(subName);
      }
      viewPaths.push({
        title: moduleName,
        items,
        mainLink: "",
      });
    }
  }

  return viewPaths;
}

const slugify = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-");
// .replace(/[^a-z0-9-]/g, "");

const normalizePath = (p: string) => "/" + p.replace(/^\/+|\/+$/g, "");

export function buildNav(allViewPaths: ViewPath[], current: string): Page[] {
  return allViewPaths.map(({ title, items = [], mainLink }) => {
    const moduleBase = `/${slugify(title)}`;

    const children =
      items && items.length > 0
        ? items.map((item) => {
            const itemSlug = toKebab(item);
            return {
              title: `${title} - ${toTitleCase(item)}`,
              link: `${moduleBase}/${itemSlug}`,
            };
          })
        : undefined;

    // Decide the "link" for the top-level item:
    // - If mainLink is provided (usually when no submodules), use it (normalized).
    // - Else if there's a single child, point to that child's link.
    // - Else point to the module base (overview).
    const link = mainLink
      ? normalizePath(mainLink)
      : children && children.length === 1
      ? children[0].link
      : moduleBase;

    // Selected if current matches the top-level link or any child, or is nested under the module base
    const isSelected = current === link.replace("/", "");

    return {
      title,
      selected: isSelected,
      ...(children ? { children } : { link }),
    } as Page;
  });
}

export const toCamel = (str: string) =>
  str
    .split(/[\/\-]/) // split by / or -
    .filter(Boolean) // remove empty parts
    .map((part, i) =>
      i === 0
        ? part.toLowerCase()
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join("");

// utils/numberCorrector.ts
export function correctNumberInput(input: string): string {
  if (!input) return "";

  // preserve leading minus
  const isNegative = input.startsWith("-");
  // remove everything except digits and dots
  const stripped = input.replace(/[^0-9.]/g, "");

  // keep only the first dot; join remaining parts (removes extra dots)
  const parts = stripped.split(".");
  const intPart = parts.shift() || "";
  const fracPart = parts.length ? parts.join("") : "";

  // if there was a fractional part, build "int.frac", else just int
  const core = fracPart ? `${intPart || "0"}.${fracPart}` : intPart;

  if (core === "" || core === "0") {
    // return empty string for totally invalid, but keep "0" as valid if input produced it
    return core === "0" ? "0" : "";
  }

  return isNegative ? `-${core}` : core;
}

export function keyListToObject<T = any>(
  keys: string[],
  value: T
): Record<string, T> {
  return keys.reduce((obj, key) => {
    obj[key] = value;
    return obj;
  }, {} as Record<string, T>);
}

export function stringToFontSize(
  line: string,
  totalWidth = 1000,
  defaultWeight = 1,
  maxSize = 100
): number {
  const lineTotal =
    mySum(
      line
        .split("")
        .map(
          (s) =>
            letterWeights[s.toUpperCase() as LetterWeightKey] ?? defaultWeight
        )
    ) + 1;
  return Math.min(maxSize, Math.round(totalWidth / lineTotal));
}
