// Styles
import * as styles from "../Navbar/Navbar.module.scss";

// Material UI Components
import { Grid, Container } from "@mui/material/";

//Local Components
import Logo from "../Logo/Logo";
import BurgerMenu from "../BurgerMenu/BurgerMenu";
import UserMenu from "../UserMenu/UserMenu";

export default function Navbar() {
  return (
    <Grid
      height={100}
      container
      direction="row"
      justifyContent="space-around"
      alignItems="center">
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
