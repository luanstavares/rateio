// Styles
import * as styles from "../Navbar/Navbar.module.scss";

// Material UI Components
import { Grid } from "@mui/material/";

//Local Components
import Logo from "../Logo/Logo";
import BurgerMenu from "../BurgerMenu/BurgerMenu";
import UserMenu from "../UserMenu/UserMenu";

export default function Navbar() {
  return (
    <Grid
      className={styles.navbar}
      height={100}
      container
      justifyContent="space-around"
      alignItems="center"
    >
      <Grid item>
        <BurgerMenu />
      </Grid>
      <Grid item>
        <Logo glow="active">Rate.io</Logo>
      </Grid>
      <Grid item>
        <UserMenu />
      </Grid>
    </Grid>
  );
}
