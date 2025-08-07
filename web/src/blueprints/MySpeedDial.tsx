import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import type { MySpeedDialProps } from "../constants/interfaces";
import { MyIcon } from "./MyIcon";

export const MySpeedDial = (props: {
  actions?: MySpeedDialProps[];
  leftSide?: boolean;
}) => {
  const { actions, leftSide } = props;
  return (
    <SpeedDial
      hidden={
        !actions ||
        actions.filter((s) => (s.hidden ? !s.hidden : true)).length === 0
      }
      ariaLabel=""
      sx={{
        position: "fixed",
        bottom: 25,
        left: leftSide ? 25 : undefined,
        right: leftSide ? undefined : 25,
        zIndex: 1,
      }}
      FabProps={{
        sx: {
          bgcolor: "teal",
          "&:hover": {
            bgcolor: "secondary.main",
          },
          padding: 4,
        },
      }}
      icon={
        <SpeedDialIcon
          icon={<MyIcon icon={leftSide ? "DisplaySettings" : "Star"} />}
          sx={{ transform: "scale(1.5)" }}
        />
      }
    >
      {actions?.map(
        (action) =>
          !action.hidden && (
            <SpeedDialAction
              tooltipTitle={action.name}
              key={action.name}
              icon={action.icon}
              onClick={action.onClick}
              sx={{
                padding: 4,
              }}
            />
          )
      )}
    </SpeedDial>
  );
};
