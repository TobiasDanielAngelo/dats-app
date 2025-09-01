import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MyNavBar } from "../../blueprints/MyNavigation";
import { buildNav, buildViewPaths, toTitleCase } from "../../constants/helpers";
import { Main } from "./_AllComponents";

export type ViewPath = {
  title: string;
  items: string[];
  mainLink: string;
};

export const defaultViewPaths = buildViewPaths(Main, [
  "Commerce",
  "Finance",
  "Product",
  "People",
]);
export const additionalPaths: ViewPath[] = [
  {
    title: "Labels",
    items: [],
    mainLink: "labels",
  },
  {
    title: "Prices",
    items: [],
    mainLink: "prices",
  },
  {
    title: "Receipts",
    items: ["purchases"],
    mainLink: "",
  },
  {
    title: "Guides",
    items: ["compatible-motors"],
    mainLink: "",
  },
];

export const allViewPaths = [...defaultViewPaths, ...additionalPaths];

export const NavBar = observer(() => {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const [loc, setLoc] = useState(location.pathname.split("/")[1]);

  const current = loc.replace("/", "");
  useEffect(() => {
    document.title =
      current.length > 0 ? "DATS - " + toTitleCase(current) : "DATS";
  }, [current]);

  useEffect(() => {
    setLoc(location.pathname.split("/")[1]);
  }, [location]);

  return (
    <MyNavBar
      title={current !== "" ? toTitleCase(location.pathname) : "DATS"}
      drawerOpen={open}
      setDrawerOpen={setOpen}
      profileUrl={"#"}
      paths={buildNav(allViewPaths, current)}
    />
  );
});
