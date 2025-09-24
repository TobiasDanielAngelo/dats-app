import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { Option } from "../constants/interfaces";
import { MyCheckBox } from "./MyCheckbox";
import { MyIcon } from "./MyIcon";
import { MyInput } from "./MyInput";

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
  noSearch?: boolean;
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
    noSearch,
  } = props;

  const [isOpen, setOpen] = useState(open ?? false);
  const [selectAll, setSelectAll] = useState(isAll);
  const [search, setSearch] = useState("");
  const [isOption, setIsOption] = useState(true);

  const filteredOptions = options?.filter((opt) =>
    String(opt.name).toLowerCase().includes(search.toLowerCase())
  );

  const onToggle = (id: number | string) => {
    if (value.includes(id)) {
      onChangeValue(value.filter((v) => v !== id));
    } else {
      if (!maxSelections || value.length < maxSelections) {
        onChangeValue([...value, id]);
      }
    }
    setOpen(false);
    setSearch("");
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

      {isOption ? (
        <View style={{ flexDirection: "row", gap: 10, flex: flex }}>
          {onPressAdd && <MyIcon icon={"plus"} onPress={onPressAdd} />}

          <Pressable
            style={{
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              borderColor: "gray",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              flex: 1,
              backgroundColor: "white",
            }}
            onPress={() => setOpen(!isOpen)}
          >
            <Text ellipsizeMode="tail">
              {!value || value.length === 0
                ? `Select ${label ?? "items"}`
                : value.slice(0, 3).join(", ") +
                  (value.length > 3 ? "..." : "")}
            </Text>
            <MyIcon
              icon={isOpen ? "angle-up" : "angle-down"}
              onPress={() => setOpen(!isOpen)}
            />
          </Pressable>

          {!noSearch && (
            <MyIcon icon={"searchengin"} onPress={() => setIsOption(false)} />
          )}
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 10 }}>
          {onPressAdd && <MyIcon icon={"plus"} onPress={onPressAdd} />}

          <View style={{ flex: 1 }}>
            <MyInput
              value={search}
              onChangeValue={setSearch}
              placeholder="Search"
            />
          </View>

          {!noSearch && (
            <MyIcon icon={"searchengin"} onPress={() => setIsOption(true)} />
          )}
        </View>
      )}

      {(isOpen || search) && (
        <View
          style={{
            marginTop: 5,
            padding: 5,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "gray",
            backgroundColor: "white",
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
            <Text onPress={() => setSelectAll((t) => !t)}>Select All</Text>
          </View>

          <FlatList
            data={filteredOptions.slice(0, 5)}
            keyExtractor={(_, i) => i.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: opt }) => (
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                }}
                key={opt.id}
              >
                <MyCheckBox
                  value={value.includes(opt.id)}
                  onChangeValue={() => onToggle(opt.id)}
                />
                <Text onPress={() => onToggle(opt.id)}>{opt.name}</Text>
              </View>
            )}
          />
        </View>
      )}
      <Text style={{ color: "darkred" }}>{msg}</Text>
    </View>
  );
};
