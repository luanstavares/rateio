import * as styles from "../Navbar/Navbar.module.scss";

import Text from "../Text/Text";

export default function Navbar() {
  return (
    <div className={styles.logo}>
      <Text mode="logo">Rate.io</Text>
    </div>
  );
}
