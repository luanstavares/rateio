import * as styles from "../styles/Home.module.scss";

import Button from "../components/Button/Button";
import Text from "../components/Text/Text";
import Background from "../components/Background/Background";
import Navbar from "../components/Navbar/Navbar";

export default function Home() {
  return (
    <div>
      <Background />
      <Navbar />
      <div className={styles.main}>
        <div className={styles.mainText}>
          <Text style="title">
            Bem vindo(a) ao <Text mode="logo">Rate.io</Text>
          </Text>
          <Text style="title">Hello World</Text>
          <Text style="h1">Hello World</Text>
          <Text style="h2">Hello World</Text>
          <Text style="h3">Hello World</Text>
          <Text style="h4">Hello World</Text>
          <Text style="h5">Hello World</Text>
          <Text style="body-large-semi-bold">Hello World</Text>
          <Text style="body-large-regular">Hello World</Text>
          <Text style="body-small-semi-bold">Hello World</Text>
          <Text style="body-small-regular">Hello World</Text>
        </div>
        <div className={styles.homeCard}>
          <>
            <Button onClick={() => window.alert("sua mãe de 4")}>
              <Text weight="semi-bold">Novo rateio</Text>
            </Button>
            <Text>ou</Text>
            <Text mode="link">Entrar em um rateio existente</Text>
          </>
        </div>
      </div>
    </div>
  );
}
