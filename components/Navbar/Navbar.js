import React, { useState } from "react";

import Link from "next/link";

// Styles
import * as styles from "../Navbar/Navbar.module.scss";

// Material UI Components
import { Grid } from "@mui/material/";

//Local Components
import Logo from "../Logo/Logo";
import BurgerMenu from "../BurgerMenu/BurgerMenu";
import UserMenu from "../UserMenu/UserMenu";

export default function Navbar({ navSize }) {
  return (
    <Grid
      className={styles.navbar}
      height={navSize}
      container
      justifyContent="space-around"
      alignItems="center"
    >
      <Grid item>
        <BurgerMenu />
      </Grid>
      <Grid item>
        <Link href="/">
          <Logo glow="active">Rate.io</Logo>
        </Link>
      </Grid>
      <Grid item>
        <UserMenu />
      </Grid>
    </Grid>
  );
}
