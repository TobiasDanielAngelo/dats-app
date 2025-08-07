import { Toolbar } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../components/core/Store";
import anon from "../assets/anon.jpg";
import { useIsUnhoverable, useKeyPress } from "../constants/hooks";
import type { Page, StateSetter } from "../constants/interfaces";
import { MyDropdownMenu } from "./MyDropdownMenu";
import { MyIcon } from "./MyIcon";
import { MyImage } from "./MyImages";
import { titleToCamel } from "../constants/helpers";

const drawerWidth = 240;

export const ResponsiveDrawer = observer(
  (props: {
    open?: boolean;
    setOpen?: StateSetter<boolean>;
    paths?: Page[];
  }) => {
    const { open, setOpen, paths } = props;
    const navigate = useNavigate();
    const { userStore } = useStore();

    useKeyPress(["KeyQ", "ShiftLeft"], () => setOpen?.(false));

    return (
      <div style={{ display: "flex" }}>
        <Drawer
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
          open={open}
          onClose={setOpen && (() => setOpen(false))}
        >
          <div className="bg-teal-100 dark:bg-gray-900 dark:text-gray-400">
            <Toolbar />
            <List>
              {paths?.map((s, ind) => (
                <ListItem key={ind} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate(s?.link ?? "/");
                      setOpen?.(false);
                    }}
                  >
                    <ListItemIcon>
                      <MyImage
                        image={titleToCamel(s.title).replace("-", "")}
                        className="w-10"
                      />
                    </ListItemIcon>
                    <ListItemText primary={s.title} secondary={""} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <List>
              {["Logout"].map((s, ind) => (
                <ListItem key={ind} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      userStore.logoutUser();
                      navigate("/login");
                      setOpen?.(false);
                    }}
                  >
                    <ListItemIcon>
                      <MyImage image="logout" className="w-10" />
                    </ListItemIcon>
                    <ListItemText primary={s} secondary={""} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </div>
        </Drawer>
      </div>
    );
  }
);

const NavLink = ({ page }: { page: Page }) => {
  const isTouch = useIsUnhoverable();
  return isTouch ? (
    <></>
  ) : (
    <div className="relative group cursor-pointer">
      {page.link ? (
        <Link
          to={page.link}
          className={
            page.selected
              ? "dark:text-gray-300 text-teal-900 font-bold"
              : "dark:text-teal-500 text-teal-500 font-bold"
          }
        >
          {page.title}
        </Link>
      ) : (
        <span
          className={
            page.selected
              ? "dark:text-gray-300 text-teal-900 font-bold"
              : "dark:text-teal-500 text-teal-500 font-bold"
          }
        >
          {page.title}
        </span>
      )}

      {page.children && page.children?.length > 0 && (
        <div className="absolute top-full left-0 z-20 hidden group-hover:block dark:bg-gray-800 bg-teal-100 rounded shadow-lg min-w-[150px] py-2">
          {page.children.map((child, idx) => (
            <Link
              key={idx}
              to={child.link ?? ""}
              className="block px-4 py-2 text-sm dark:text-white text-teal-700 hover:bg-teal-200 dark:hover:bg-gray-400"
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const MyNavBar = observer(
  (props: {
    title?: string;
    drawerOpen?: boolean;
    setDrawerOpen?: StateSetter<boolean>;
    profileUrl?: string;
    paths?: Page[];
  }) => {
    const { title, drawerOpen, setDrawerOpen, profileUrl, paths } = props;

    const { settingStore } = useStore();
    const navigate = useNavigate();

    const [open2, setOpen2] = useState(false);

    const onClickLogout = async () => {
      navigate("/login");
    };

    const leafPages = paths?.flatMap((p) => {
      const leaves = p.children?.length
        ? p.children.filter((c) => !c.children?.length)
        : [];

      if (p.link) {
        leaves.push({
          title: p.title,
          link: p.link,
        });
      }
      return leaves.length ? leaves : [p];
    });

    return (
      <nav className="relative bg-teal-200 border-teal-200 dark:bg-gray-900">
        <ResponsiveDrawer
          open={drawerOpen}
          setOpen={setDrawerOpen}
          paths={leafPages}
        />
        <div className="flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Link to={"/menu"}>
              <MyIcon
                icon="InsertChart"
                fontSize="large"
                className="text-gray-700 dark:text-gray-100 hover:text-green-700 hover:scale-125 [&:not(hover)]:transition-all hover:transition-all ease-in-out hover:animate-pulse"
              />
            </Link>
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              {title}
            </span>
          </div>

          <div className="md:w-auto" id="navbar-default">
            <ul className="font-medium flex items-center justify-center md:p-0 mt-4 border border-teal-100 rounded-lg flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 dark:border-gray-700">
              {paths?.map((s, ind) => (
                <div key={ind} className="hidden xl:block">
                  <NavLink page={s} />
                </div>
              ))}
              <div className="items-center content-center place-items-center place-content-center justify-center justify-items-center">
                <img
                  className="w-8 h-8 rounded-full cursor-pointer hidden lg:block"
                  src={profileUrl}
                  onClick={() => setOpen2((t) => !t)}
                  onError={(e) => {
                    e.currentTarget.src = anon;
                  }}
                />
                <MyDropdownMenu
                  setOpen={setOpen2}
                  open={open2}
                  actions={[
                    ...(leafPages?.map((s) => ({
                      title: s.title,
                      selected: false,
                      onClick: () => {
                        navigate(s?.link ?? "/");
                        setOpen2(false);
                      },
                    })) ?? []),
                    {
                      title: "Toggle Theme",
                      selected: false,
                      onClick: settingStore.toggleTheme,
                    },
                    {
                      title: "Logout",
                      selected: false,
                      onClick: onClickLogout,
                    },
                  ]}
                />
              </div>
              <li>
                <div
                  className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                  onClick={settingStore.toggleTheme}
                >
                  <MyIcon
                    icon={
                      settingStore.theme() === "dark" ? "DarkMode" : "LightMode"
                    }
                  />
                </div>
              </li>

              <li>
                <div
                  className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                  onClick={setDrawerOpen && (() => setDrawerOpen((t) => !t))}
                >
                  <MyIcon icon="Menu" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
);
