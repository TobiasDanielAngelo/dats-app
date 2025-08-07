import { observer } from "mobx-react-lite";
import { toRomanWithExponents, toTitleCase } from "../constants/helpers";
import { type ItemDetailsProps } from "../constants/interfaces";
import { formatValue } from "../constants/JSXHelpers";

const sectionStyles: Record<string, string> = {
  Header: "text-sm flex flex-row",
  Important: "font-bold text-3xl px-3 rounded",
  Body: "text-lg px-7",
};

export const ItemDetails = observer(
  <T extends Record<string, any>>({
    item,
    shownFields = [],
    header = [],
    important = [],
    prices = [],
    showMore,
    itemMap = [],
    related = [],
  }: ItemDetailsProps<T>) => {
    const itemView = item.$view ?? item;

    const allItemKeys = [
      ...new Set(Object.keys(itemView).filter((s) => !s.includes("$"))),
    ] as (keyof T)[];

    const sections = [
      { title: "Header", keys: header },
      { title: "Important", keys: important },
      {
        title: "Body",
        keys: allItemKeys.filter(
          (key) => !header.includes(key) && !important.includes(key)
        ),
      },
    ];

    // const hiddenKeys = allItemKeys.filter((s) => !shownFields.includes(s));

    const renderRow = (key: keyof T, title: string) => {
      const value = item[key];
      const relatedName = related?.find(
        (s) => s.field === key && s.id === item[key]
      )?.name;
      const kv = itemMap?.find((s) => s.key === key);
      const keyTitle = key === "id" ? "ID" : toTitleCase(key as string);
      const body =
        key === "id"
          ? toRomanWithExponents(value)
          : formatValue(
              relatedName ?? value,
              String(key),
              prices as string[],
              kv
            );

      return body === "—" ? (
        <div key={String(key)}></div>
      ) : (
        <div key={String(key)} className="flex flex-col xs:flex-row">
          {title === "Body" && (
            <span className="pt-2 text-xs font-bold">{keyTitle}</span>
          )}
          <span className="pl-3 whitespace-pre-wrap break-words">{body}</span>
        </div>
      );
    };

    return (
      <>
        {sections.map(({ title, keys }) => (
          <div key={title} className={sectionStyles[title] || ""}>
            {keys
              .filter((key) => shownFields.includes(key) || showMore)
              .map((key) => renderRow(key, title))}
            {/* {title === "Body" &&
              showMore &&
              hiddenKeys.map((key) => renderRow(key, title))} */}
          </div>
        ))}
      </>
    );
  }
);
