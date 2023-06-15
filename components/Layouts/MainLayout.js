"use client";
import React, { useState } from "react";

import Navbar from "../Navbar/Navbar";
import { Grid } from "@mui/material";

export default function MainLayout({ children }) {
  const [navSize, setNavSize] = useState(100);

  return (
    <>
      <Navbar navSize={navSize} />
      <Grid
        sx={{
          height: `calc(100dvh - ${navSize}px)`,
          overflow: "hidden",
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
