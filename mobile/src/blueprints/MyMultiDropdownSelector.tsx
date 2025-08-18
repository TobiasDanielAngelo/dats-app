import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { Option } from "../constants/interfaces";
import { MyCheckBox } from "./MyCheckbox";
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
  isAll?: boolean;
  fetchFcn?: (t: string) => void;
  searchFcn?: (t: string) => void;
  onPressAdd?: () => void;
  flex?: number;
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
    onPressAdd,
    flex,
    searchFcn,
  } = props;
  const [isOpen, setOpen] = useState(open ?? false);
  const [selectAll, setSelectAll] = useState(isAll);
  const [search, setSearch] = useState("");

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
    onChangeValue(selectAll ? options.map((s) => s.id) : value);
  }, [selectAll, options.length]);

  useEffect(() => {
    onChangeValue(
      selectAll ? options.map((s) => s.id) : value === null ? [] : value
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search !== "" && searchFcn?.(`display_name__search=${search}&page=1`);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchFcn?.("page=1");
    if (value) fetchFcn?.(`id__in=${value}`);
  }, [value]);

  return (
    <View style={{ position: "relative", paddingHorizontal: 2, flex: flex }}>
      {label && (
        <Text style={{ fontSize: 15, color: "blue", marginBottom: 5 }}>
          {label}
        </Text>
      )}

      <Pressable
        style={{
          borderWidth: 1,
          borderRadius: 5,
          paddingHorizontal: 10,
          borderColor: "gray",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
        onPress={() => setOpen(!isOpen)}
      >
        <Text>
          {!value || value.length === 0
            ? `Select ${label ?? "items"}`
            : value.slice(0, 3).join(", ") + (value.length > 3 ? "..." : "")}
        </Text>
        <MyIcon
          icon={isOpen ? "angle-up" : "angle-down"}
          onPress={() => setOpen(!isOpen)}
        />
      </Pressable>

      {isOpen && (
        <View
          style={{
            marginTop: 5,
            padding: 5,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "gray",
            backgroundColor: "whtie",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MyCheckBox
              value={selectAll}
              onChangeValue={() => setSelectAll((t) => !t)}
            />
            <Text>Select All</Text>
          </View>
          <FlatList
            data={options}
            keyExtractor={(_, i) => i.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: opt }) => (
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <MyCheckBox
                  value={value.includes(opt.id)}
                  onChangeValue={() => onToggle(opt.id)}
                />
                <Text>{opt.name}</Text>
              </View>
            )}
          />
        </View>
      )}
      <Text style={{ color: "darkred" }}>{msg}</Text>
    </View>
  );
};
