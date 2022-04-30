import * as styles from "../styles/Home.module.scss";

import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import Text from "../components/Text/Text";

export default function Home() {
  return (
    <div>
      <div className={styles.bg}>
        <div className={styles.bgGradient}></div>
        <div className={styles.bgCircle}></div>
      </div>
      <div className={styles.homeCard}>
        <Card>
          {
            <Button onClick={() => window.alert("sua mãe de 4")}>
              <Text weight="bold">Criar um novo rateio</Text>
            </Button>
          }

          <Text weight="bold">ou</Text>
          <Text mode="link">Entrar em um rateio existente</Text>
        </Card>
      </div>
    </div>
  );
}
