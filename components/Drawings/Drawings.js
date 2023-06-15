import React from "react";

// Material UI Components
import { useTheme, useMediaQuery } from "@mui/material";

// Local Components
import Illustration from "../../components/Illustration/Illustration";
import HomeIcons from "../../components/HomeIcons/HomeIcons";

export default function Drawings() {
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isXs = useMediaQuery(theme.breakpoints.up("xs"));
  return (
    <>
      <Illustration
        size={isXl ? "600" : isLg ? "500" : isMd ? "400" : isSm ? "350" : "0"}
      />
      <HomeIcons
        size={isXl ? "350" : isLg ? "300" : isMd ? "300" : isSm ? "225" : "0"}
      />
    </>
  );
}
