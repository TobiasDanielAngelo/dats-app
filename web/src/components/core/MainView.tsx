import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useStore } from "./Store";
import { Main } from "./_AllComponents";
import { NavBar } from "./NavigationBar";

function buildRoutes(obj: any, basePath = "") {
  const routes: { path: string; component: any }[] = [];

  for (const key in obj) {
    const value = obj[key];
    const newPath = `${basePath}/${key.toLowerCase()}`;

    if (typeof value === "function" || "$$typeof" in value) {
      // Direct React component → use basePath as route
      routes.push({ path: basePath, component: value });
    } else if (typeof value === "object") {
      // If object contains a View key, use it directly
      if (
        "View" in value &&
        (typeof value.View === "function" || "$$typeof" in value.View)
      ) {
        routes.push({ path: newPath, component: value.View });
      } else {
        routes.push(...buildRoutes(value, newPath));
      }
    }
  }

  return routes;
}

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
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </div>
  );
});
