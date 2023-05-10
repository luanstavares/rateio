// Style
import * as styles from "../styles/Home.module.scss";

// Material UI Components
import { Typography, Button } from "@mui/material/";

// Local Components
import Navbar from "../components/Navbar/Navbar";
import Logo from "../components/Logo/Logo";

// Icons
import { ArrowRight, UsersThree } from "phosphor-react";

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
            startIcon={<UsersThree />}
            onClick={() => window.alert("sua mãe de 4")}
          >
            Novo Rateio
          </Button>

          <Typography variant="subtitle1">ou</Typography>
          <Button
            size="medium"
            variant="outlined"
            href="#"
            endIcon={<ArrowRight />}
          >
            Entrar em um rateio existente
          </Button>
        </div>
      </div>
    </div>
  );
}
