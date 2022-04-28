import Head from "next/head";
import Image from "next/image";
import * as styles from "../styles/Home.module.scss";

import Button from "../components/Button/Button";
import Card from "../components/Card/Card";

export default function Home() {
  return (
    <>
      <div className={styles.bg}></div>
      <Card className={styles.homeCard}>
        {<Button className={styles.homeButton} />}
        <p>ou</p>
        <p>Entrar em um rateio existente</p>
      </Card>
    </>
  );
}
