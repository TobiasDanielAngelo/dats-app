import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SaleView } from "../commerce/SaleComponents";
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

  return (
    <div className="flex flex-col min-h-screen text-teal-700 dark:text-gray-400">
      <SaleView />
    </div>
  );
});
