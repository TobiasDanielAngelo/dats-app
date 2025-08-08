import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MyNavBar } from "../../blueprints/MyNavigation";
import { toTitleCase } from "../../constants/helpers";

export type ViewPath = {
  title: string;
  items: string[];
  mainLink: string;
};

const allViewPaths: ViewPath[] = [];

export const NavBar = observer(() => {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const [loc, setLoc] = useState(location.pathname.split("/")[1]);

  const current = loc.replace("/", "");
  useEffect(() => {
    document.title =
      current.length > 0
        ? "HQ - " + toTitleCase(current)
        : "Mathiavelli Self-HQ";
  }, [current]);

  useEffect(() => {
    setLoc(location.pathname.split("/")[1]);
  }, [location]);

  const nav = allViewPaths.map(({ title, items, mainLink }) => {
    const allPaths = [...items, ...(mainLink ? [mainLink] : [])];
    const isSelected = allPaths.includes(current);

    return {
      title,
      selected: isSelected,
      ...(items.length > 1
        ? {
            children: items.map((item) => ({
              title:
                item.charAt(0).toUpperCase() + item.slice(1).replace("-", " "),
              link: `/${item}`,
            })),
          }
        : {
            link: `/${items[0]}`,
          }),
      ...(mainLink && items.length > 1 ? { link: `/${mainLink}` } : {}),
    };
  });

  return (
    <MyNavBar
      title="Mathiavelli Self-HQ"
      drawerOpen={open}
      setDrawerOpen={setOpen}
      profileUrl={"#"}
      paths={nav}
    />
  );
});
