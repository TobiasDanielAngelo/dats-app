import { StyleSheet, View } from "react-native";
import { Menu, MenuCard } from "./MenuCard";
import { useLocation } from "react-router-native";

export const MenuBar = (props: { items: Menu[]; hidden?: boolean }) => {
  const location = useLocation();
  const { items, hidden } = props;
  return (
    !hidden && (
      <View style={styles.main}>
        {items.map((s, ind) => (
          <MenuCard
            {...s}
            key={ind}
            selected={location.pathname === s.location}
          />
        ))}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    minHeight: 20,
    maxHeight: "15%",
    backgroundColor: "gainsboro",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
