import moment from "moment";
import { GuidedDiv } from "../blueprints/MyGuidedDiv";
import { isDatetimeValue, isDateValue, toMoney } from "./helpers";
import ReactMarkdown from "react-markdown";
import type { KV } from "./interfaces";

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function prettifyJSON(str: string): string {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2); // 2-space indent
  } catch {
    return str; // or throw an error, or return '', up to you
  }
}

export const formatValue = (
  value: any,
  key: string,
  prices?: string[],
  kv?: KV<any>,
  arrayIsInfinite?: boolean
) => {
  const formatList = (
    value: Date[],
    formatStr: string,
    suffixLabel: string
  ): string => {
    const list = value
      .slice(0, 3)
      .map((s) => moment(s).format(formatStr))
      .join("\n");

    const remaining = value.length - 4;
    const suffix = arrayIsInfinite
      ? `${suffixLabel}ad infinitum...`
      : value.length > 4
      ? `${suffixLabel}and ${remaining} more...`
      : "";

    const finalDate =
      !arrayIsInfinite && value.length > 3
        ? `\nup to ${moment(value[value.length - 1]).format(formatStr)}`
        : "";

    return list + suffix + finalDate;
  };

  const fileExtensionRegex = /\.(jpg|jpeg|png|gif|pdf|docx?|xlsx?|txt)$/i;
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

  if (kv) {
    const lookup = (val: any) =>
      kv.label === ""
        ? kv.values.find((_, i) => i === val)
        : kv.values.find((v) => v.id === val)?.[kv.label] ?? "—";

    return Array.isArray(value) ? value.map(lookup).join(",") : lookup(value);
  }
  if (prices?.includes(key)) return toMoney(value);

  if (value instanceof File) {
    const url = URL.createObjectURL(value);
    return (
      <a href={url} download={value.name}>
        ⬇️ Download {value.name}
      </a>
    );
  } else if (value instanceof Blob) {
    const url = URL.createObjectURL(value);
    return (
      <a href={url} download="file">
        ⬇️ Download file
      </a>
    );
  } else if (typeof value === "string" && value.match(fileExtensionRegex)) {
    return (
      <GuidedDiv
        title={
          imageExtensions.test(value) ? <img src={value} width={200} /> : value
        }
      >
        <a href={value} target="_blank" rel="noopener noreferrer">
          🔗 Link
        </a>
      </GuidedDiv>
    );
  }

  if (typeof value === "boolean") {
    return value ? "✅ Yes" : "❌ No";
  }
  if (Array.isArray(value) && value.length > 0) {
    if (isDatetimeValue(value[0])) {
      return formatList(value, "MMM D, YYYY h:mm A", "\n");
    }
    if (isDateValue(value[0])) {
      return formatList(value, "MMM D, YYYY", "and ");
    } else {
      return value.join(", ");
    }
  } else {
    if (isDatetimeValue(value)) {
      return moment(value).format("MMM D, YYYY h:mm A");
    }
    if (isDateValue(value)) {
      return moment(value).format("MMM D, YYYY");
    }
  }

  return value && value !== "—" ? (
    <ReactMarkdown>{prettifyJSON(String(value)) || "—"}</ReactMarkdown>
  ) : (
    "—"
  );
};
