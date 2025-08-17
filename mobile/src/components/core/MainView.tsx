import { observer } from "mobx-react-lite";
import { ImageBackground, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Route, Routes, useNavigate } from "react-router-native";
import { MenuBar } from "../../blueprints/MenuBar";
import { Menu } from "../../blueprints/MenuCard";
import { buildRoutes } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { Main } from "./_AllComponents";
import { NavBar } from "./NavigationBar";
import { useStore } from "./Store";
import { useEffect } from "react";
import { ModularView } from "./ModularView";

export const MainView = observer(() => {
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const { isVisible1, setVisible1 } = useVisible();

  const { settingStore } = useStore();

  const menuItems = [
    { name: "bars", label: "Modular", onPress: () => navigate("/menu") },
    { name: "bars", label: "Menu", onPress: () => setVisible1(true) },
    // { name: "star", label: "Testing", onPress: () => navigate("/testing") },
  ] satisfies Menu[];

  const fetchAll = async () => {
    const arr = await Promise.all([settingStore.fetchAll("page=all")]);
    if (!arr.every((item: any) => item.ok)) {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const routes = buildRoutes(Main);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <ImageBackground
        source={require("../../../assets/faintgreen.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <Routes>
          <Route path="menu" element={<ModularView />} />
          <Route path="" element={<ModularView />} />
          {routes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={<Component routePath={path} />}
            />
          ))}
        </Routes>
      </ImageBackground>
      <NavBar drawerOpen={isVisible1} setDrawerOpen={setVisible1} />
      <MenuBar items={menuItems} />
    </View>
  );
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
