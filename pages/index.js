import * as styles from "../styles/Home.module.scss";

import Button from "../components/Button/Button";
import Text from "../components/Text/Text";
import Background from "../components/Background/Background";
import Navbar from "../components/Navbar/Navbar";
import Logo from "../components/Logo/Logo";

export default function Home() {
  return (
    <div>
      <Background />
      <Navbar />
      <div className={styles.main}>
        <div className={styles.main__text}>
          <Text style="text__title">
            Bem vindo(a) ao <Logo style="logo__extra__large" />
          </Text>
          <Text style="text__h2">
            Bem vindo(a) ao <Logo style="logo__large" />
          </Text>
          <Text style="text__h3">
            Bem vindo(a) ao <Logo style="logo__medium" />
          </Text>
          <Text style="text__h4">
            Bem vindo(a) ao <Logo style="logo__small" />
          </Text>
        </div>
        <Button onClick={() => window.alert("sua mãe de 4")}>
          <Text style="h5">Novo rateio</Text>
        </Button>
        <Text style="h5">ou</Text>
        <Text style="h5" mode="link">
          Entrar em um rateio existente
        </Text>
      </div>
    </div>
  );
}
