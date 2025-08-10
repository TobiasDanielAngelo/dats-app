import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { buildRoutes } from "../../constants/helpers";
import { Main } from "./_AllComponents";
import { NavBar } from "./NavigationBar";
import { useStore } from "./Store";

export const MainView = observer(() => {
  const navigate = useNavigate();
  const { settingStore } = useStore();

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

  useEffect(() => {
    if (settingStore.theme() === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settingStore.theme()]);

  return (
    <div className="flex flex-col min-h-screen text-teal-700 dark:text-gray-400">
      <NavBar />
      <Routes>
        {routes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={<Component routePath={path} />}
          />
        ))}
      </Routes>
    </div>
  );
});
