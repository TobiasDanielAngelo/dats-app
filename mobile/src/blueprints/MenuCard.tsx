import { StyleSheet, TouchableOpacity } from "react-native";
import { MyIcon } from "./MyIcon";
import { useNavigate } from "react-router-native";

export type Menu = {
  name: string;
  label: string;
  onPress?: () => void;
  location?: string;
  selected?: boolean;
};

export const MenuCard = (props: Menu) => {
  const { name, label, onPress, location, selected } = props;
  const navigate = useNavigate();
  return (
    <TouchableOpacity
      style={[
        styles.main,
        {
          backgroundColor: selected ? "lightseagreen" : "teal",
        },
      ]}
      onPress={onPress ? onPress : () => navigate(location ?? "/")}
    >
      <MyIcon
        icon={name}
        label={label}
        onPress={onPress ? onPress : () => navigate(location ?? "/")}
        color="white"
        size={15}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 10,
  },
  text: { color: "white" },
});
