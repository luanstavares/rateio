import * as styles from "../styles/Home.module.scss";

import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import Text from "../components/Text/Text";

export default function Home() {
  return (
    <div className={styles.bg}>
      <Card className={styles.homeCard}>
        {
          <Button
            className={styles.homeButton}
            onClick={() => window.alert('sua mãe aquela puta')}
          >
            <Text weight="bold">Criar rateio</Text>
          </Button>
        }

        <Text weight="bold">ou</Text>
        <Text>Entrar em um rateio existente</Text>
      </Card>
    </div>
  );
}
