import * as styles from "./Background.module.scss";

export default function Background({ children }) {
  return (
    <div className={styles.background}>
      <div className={styles.background__color}></div>
    </div>
  );
}
