import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DjangoFields, DjangoModelField } from "../../constants/djangoHelpers";
import {
  camelToSnakeCase,
  decodeShortParam,
  generateShortParam,
  getMonthName,
  toOptions,
  toTitleCase,
} from "../../constants/helpers";
import { useKeyPress } from "../../constants/hooks";
import { type Field } from "../../constants/interfaces";
import { MyButton } from "../MyButton";
import { MyDateTimePicker } from "../MyDateTimePicker";
import { MyIcon } from "../MyIcon";
import { MyInput } from "../MyInput";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";

const getInitialDetails = (fields: Field[][]) =>
  fields.flat().reduce<Record<string, string>>((acc, { name }) => {
    acc[name] = "";
    return acc;
  }, {});

const parseMultiValue = (val: string) =>
  val ? val.split(",").map(Number) : [];

const formatMultiValue = (val: number[]) => val.join(",");

const renderField = (
  field: Field,
  value: any,
  onChangeValue: (val: string) => void
) => {
  const commonProps = {
    label: field.label,
    value,
  };

  switch (field.type) {
    case "number":
    case "text":
      return (
        <MyInput
          {...commonProps}
          key={field.name}
          onChangeValue={onChangeValue}
          value={value ?? ""}
        />
      );
    case "multi":
      return (
        <MyMultiDropdownSelector
          {...commonProps}
          key={field.name}
          options={field.options}
          value={parseMultiValue(value)}
          onChangeValue={(u) => onChangeValue(formatMultiValue(u.map(Number)))}
        />
      );
    case "check":
      return (
        <MyMultiDropdownSelector
          {...commonProps}
          key={field.name}
          options={toOptions(["No", "Yes"])}
          value={parseMultiValue(value)}
          onChangeValue={(u) => onChangeValue(formatMultiValue(u.map(Number)))}
        />
      );
    case "date":
    case "time":
    case "datetime":
      return (
        <div className="text-black" key={field.name}>
          <MyDateTimePicker
            {...commonProps}
            isDateOnly={["date", "month"].includes(field.type)}
            isTimeOnly={field.type === "time"}
            onChangeValue={(u) =>
              onChangeValue(
                field.type === "date"
                  ? moment(u).format("YYYY-MM-DD")
                  : moment(u).toISOString()
              )
            }
          />
        </div>
      );
    case "year":
      return (
        <MyMultiDropdownSelector
          {...commonProps}
          key={field.name}
          options={Array.from({ length: 51 }, (_, i) => ({
            id: 2000 + i,
            name: String(2000 + i),
          }))}
          value={parseMultiValue(value)}
          onChangeValue={(u) => onChangeValue(formatMultiValue(u.map(Number)))}
        />
      );
    case "month":
      return (
        <MyMultiDropdownSelector
          {...commonProps}
          key={field.name}
          options={Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            name: getMonthName(i),
          }))}
          value={parseMultiValue(value)}
          onChangeValue={(u) => onChangeValue(formatMultiValue(u.map(Number)))}
        />
      );
    case "day":
      return (
        <MyMultiDropdownSelector
          {...commonProps}
          key={field.name}
          options={Array.from({ length: 31 }, (_, i) => ({
            id: i + 1,
            name: String(i + 1),
          }))}
          value={parseMultiValue(value)}
          onChangeValue={(u) => onChangeValue(formatMultiValue(u.map(Number)))}
        />
      );
    default:
      return (
        <div
          className="text-blue-500 items-center justify-center"
          key={field.name}
        >
          {field.label}
        </div>
      );
  }
};

export const MyFilter = observer(({ fields }: { fields: Field[][] }) => {
  const [details, setDetails] = useState(getInitialDetails(fields));
  const [params, setParams] = useSearchParams();

  const onChangeValue = (val: string, name: string) => {
    setDetails({ ...details, [name]: val });
  };

  const onClickFilter = () => {
    if (
      !Object.entries(details).filter(([_, v]) => v != null && v !== "").length
    ) {
      setParams("");
      return;
    }

    const filtered = Object.fromEntries(
      Object.entries(details).filter(([_, v]) => v != null && v !== "")
    );
    setParams("q=" + generateShortParam(filtered));
  };

  const onClickReset = () => {
    setDetails(getInitialDetails(fields));
    setParams("");
  };
  useKeyPress(["Enter"], onClickFilter);

  useEffect(() => {
    if (params.size) {
      setDetails(decodeShortParam(params.toString().replace("q=", "")));
    }
  }, [params.size]);

  return (
    <div className="max-w-xl mx-auto p-2 dark:bg-gray-900 text-gray-200">
      {fields.map((row, i) => (
        <div
          key={i}
          className="grid md:gap-6"
          style={{
            gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
          }}
        >
          {row.map((field) =>
            renderField(field, details[field.name], (val) =>
              onChangeValue(val, field.name)
            )
          )}
        </div>
      ))}

      <div className="flex flex-row-reverse justify-between items-center mt-4">
        <MyButton onClick={onClickFilter} label="Filter Results" />
        <MyIcon icon="RestartAlt" fontSize="large" onClick={onClickReset} />
      </div>
    </div>
  );
});

type Props<T extends Record<string, any>> = {
  view?: T;
  fields: Record<string, DjangoModelField>;
  title?: string;
  setVisible?: (t: boolean) => void;
  dateFields?: string[];
  excludeFields?: (keyof T)[];
  relatedFields?: string[];
  optionFields?: string[];
};

export const MyGenericFilter = <T extends Record<string, any>>({
  fields,
  title = "Filters",
  dateFields = [],
  excludeFields = [],
  relatedFields = [],
  optionFields = [],
}: Props<T>) => {
  const [shownFields, setShownFields] = useState([...Object.keys(fields)]);

  const allFields: Field[][] = useMemo(
    () =>
      Object.entries(fields).flatMap(([key, value]) => {
        if (excludeFields.includes(key) || !shownFields.includes(key))
          return [];
        const baseName = camelToSnakeCase(key);
        const label = toTitleCase(key);

        if (dateFields.includes(key)) {
          return [
            [
              {
                name: `${baseName}`,
                label: `${label}`,
                type: "",
              },
            ],
            [
              {
                name: `${baseName}__gte`,
                label: `Start`,
                type: "date",
              },
              {
                name: `${baseName}__lte`,
                label: `End`,
                type: "date",
              },
            ],
            [
              {
                name: `${baseName}__year__in`,
                label: `Year`,
                type: "year",
              },
              {
                name: `${baseName}__month__in`,
                label: `Month`,
                type: "month",
              },
              {
                name: `${baseName}__day__in`,
                label: `Day`,
                type: "day",
              },
            ],
          ];
        } else if (
          [...relatedFields].includes(key) ||
          DjangoFields[value.field].type === "text"
        ) {
          return [
            [
              {
                name: `${baseName}__search`,
                label: `${label} Search`,
                type: "text",
              },
            ],
          ];
        } else if (optionFields.includes(key)) {
          return [
            [
              {
                name: `${baseName}__in`,
                label: label,
                type: "multi",
                options: value.choices,
              },
            ],
          ];
        } else if (
          typeof value === "number" ||
          DjangoFields[value.field].type === "number"
        ) {
          return [
            [
              {
                name: `${baseName}__gte`,
                label: `${label} ≥`,
                type: "number",
              },
              {
                name: `${baseName}`,
                label: `${label} =`,
                type: "number",
              },
              {
                name: `${baseName}__lte`,
                label: `${label} ≤`,
                type: "number",
              },
            ],
          ];
        } else if (typeof value === "boolean") {
          return [
            [
              {
                name: `${baseName}__in`,
                label: `${label}?`,
                type: "check",
              },
            ],
          ];
        }

        return [];
      }),
    [
      relatedFields.length,
      excludeFields.length,
      dateFields.length,
      optionFields.length,
      shownFields.length,
    ]
  );

  return (
    <div className="m-2">
      <h1 className="text-xl mb-2 font-bold tracking-tight md:text-2xl dark:text-white">
        {title}
      </h1>
      <MyMultiDropdownSelector
        label="Fields"
        value={shownFields}
        onChangeValue={(t) => setShownFields(t as string[])}
        options={Object.keys(fields).map((s) => ({
          id: s,
          name: toTitleCase(s),
        }))}
        relative
      />
      <MyFilter fields={allFields} />
    </div>
  );
};
