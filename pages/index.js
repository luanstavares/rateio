import * as styles from "../styles/Home.module.scss";

import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import Text from "../components/Text/Text";
import Background from "../components/Background/Background";

export default function Home() {
  return (
    <div>
      <Background />
      <div className={styles.main}>
        <Text weight="light" size="title">
          Bem vindo(a) ao <Text mode="logo">Rateio</Text>
        </Text>
        <div className={styles.homeCard}>
          <Card>
            <Button onClick={() => window.alert("sua mãe de 4")}>
              <Text weight="bold">Criar um novo rateio</Text>
            </Button>
            <Text weight="bold">ou</Text>
            <Text mode="link">Entrar em um rateio existente</Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
