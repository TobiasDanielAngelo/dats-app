import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Route, Routes, useNavigate } from "react-router-native";
import { Menu } from "../../blueprints/MenuCard";
import { buildRoutes } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { TransactionQuickView } from "../finance/MoreTransactionComponents";
import { ModularView } from "./ModularView";
import { useStore } from "./Store";
import { Main } from "./_AllComponents";
import { MenuBar } from "../../blueprints/MenuBar";
import { PurchaseQuickView } from "../commerce/MorePurchaseComponents";
import { TestingView } from "./TestingView";

export const MainView = observer(() => {
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const { isVisible1, setVisible1 } = useVisible();

  const { settingStore } = useStore();

  const menuItems = [
    {
      name: "money-bill-wave",
      label: "Finance Report",
      onPress: () => navigate("/"),
    },
    {
      name: "file-signature",
      label: "Purchase Order",
      onPress: () => navigate("/purchase"),
    },
    // { name: "bars", label: "Menu", onPress: () => setVisible1(true) },
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
          <Route path="/" element={<TransactionQuickView />} />
          <Route path="/purchase" element={<PurchaseQuickView />} />
          {routes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={<Component routePath={path} />}
            />
          ))}
          <Route path="/testing" element={<TestingView />} />
        </Routes>
      </ImageBackground>
      {/* <NavBar drawerOpen={isVisible1} setDrawerOpen={setVisible1} /> */}
      <MenuBar items={menuItems} />
    </View>
  );
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
