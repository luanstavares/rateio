"use client";
import React, { useState } from "react";

// MUI components
import { Box, Drawer, IconButton } from "@mui/material";

export default function DrawerMenu({ anchor, content, icon }) {
  const [state, setState] = useState({ [anchor]: false });

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  return (
    <>
      <IconButton onClick={toggleDrawer(true)}>{icon}</IconButton>

      <Drawer
        anchor={anchor}
        open={state[anchor]}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{
            marginTop: "10px",
            width: 250,
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          {content}
        </Box>
      </Drawer>
    </>
  );
}
