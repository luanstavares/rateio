import React, { useState } from "react";
import { Box, Drawer, IconButton, useTheme } from "@mui/material/";
import { List } from "phosphor-react";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MenuList from "../MenuList/MenuList";

export default function DrawerMenu({ thisAnchor = "left" }) {
  const theme = useTheme();

  const [state, setState] = useState({
    left: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <Box
      sx={{
        marginTop: "10px",
        width: 250,
      }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      {anchor === "left" ? <MenuList /> : <h1>bye</h1>}
    </Box>
  );

  return (
    <>
      <IconButton onClick={toggleDrawer(thisAnchor, true)}>
        <List />
      </IconButton>

      <Drawer
        anchor={thisAnchor}
        open={state[thisAnchor]}
        onClose={toggleDrawer(thisAnchor, false)}
      >
        {list(thisAnchor)}
      </Drawer>
    </>
  );
}
