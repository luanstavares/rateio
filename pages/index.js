import * as styles from "../styles/Home.module.scss";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Navbar from "../components/Navbar/Navbar";
import Logo from "../components/Logo/Logo";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";

export default function Home() {
  return (
    <div>
      <Navbar />

      <div className={styles.main}>
        <div className={styles.main__text}>
          <Typography variant="h3">
            Bem vindo ao <Logo size="medium" />
          </Typography>
          <Typography variant="subtitle1">
            O app que te ajuda a dividir a conta entre amigos.
          </Typography>
        </div>
        <div className={styles.main__options}>
          <Button
            color="primary"
            variant="contained"
            size="medium"
            startIcon={<GroupsRoundedIcon fontSize="inherit" />}
            onClick={() => window.alert("sua mãe de 4")}
          >
            Novo Rateio
          </Button>

          <Typography variant="subtitle1">ou</Typography>
          <Button
            size="medium"
            variant="outlined"
            href="#"
            endIcon={<ArrowForwardRoundedIcon fontSize="inherit" />}
          >
            Entrar em um rateio existente
          </Button>
        </div>
      </div>
    </div>
  );
}
