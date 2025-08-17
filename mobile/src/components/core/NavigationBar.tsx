import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-native";
import { MyNavBar } from "../../blueprints/MyNavigation";
import { buildNav, buildViewPaths } from "../../constants/helpers";
import { StateSetter } from "../../constants/interfaces";
import { Main } from "./_AllComponents";

export const allViewPaths = buildViewPaths(Main, [
  "Commerce",
  "Product",
  "People",
]);

export const NavBar = observer(
  (props: { drawerOpen: boolean; setDrawerOpen: StateSetter<boolean> }) => {
    const location = useLocation();
    const { drawerOpen, setDrawerOpen } = props;
    const [loc, setLoc] = useState(location.pathname.split("/")[1]);

    const current = loc.replace("/", "");

    useEffect(() => {
      setLoc(location.pathname.split("/")[1]);
    }, [location]);

    return (
      <MyNavBar
        title="Mathiavelli Self-HQ"
        profileUrl={"#"}
        paths={buildNav(allViewPaths, current)}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    );
  }
);
