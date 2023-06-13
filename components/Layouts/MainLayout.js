import React, { useState } from "react";

import * as styles from "./MainLayout.module.scss";
import Navbar from "../Navbar/Navbar";
import { Box, Grid } from "@mui/material";

export default function MainLayout({ children }) {
  const [navSize, setNavSize] = useState(100);

  return (
    <>
      <Navbar navSize={navSize} />
      <Grid
        sx={{
          height: `calc(100dvh - ${navSize}px)`,
        }}
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        {children}
      </Grid>
    </>
  );
}
