import * as styles from "./Background.module.scss";

export default function Background({ children }) {
  return (
    <div className={styles.bg}>
      <div className={styles.bgColor}></div>
    </div>
  );
}
