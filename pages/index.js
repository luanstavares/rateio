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
        <div className={styles.mainText}>
          <Text weight="extra-light" size="title">
            Bem vindo(a) ao <Text mode="logo">Rateio</Text>
          </Text>
          <Text size="large" weight="light">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam
            purus sit amet luctus venenatis. Bibendum ut tristique et egestas
            quis ipsum. Maecenas volutpat blandit aliquam etiam.
          </Text>
        </div>
        <div className={styles.homeCard}>
          <Card>
            <Button onClick={() => window.alert("sua mãe de 4")}>
              <Text weight="semi-bold">Novo rateio</Text>
            </Button>
            <Text>ou</Text>
            <Text mode="link">Entrar em um rateio existente</Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
