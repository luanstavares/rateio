import * as styles from "../Navbar/Navbar.module.scss";

import Logo from "../Logo/Logo";

export default function Navbar() {
  return (
    <div className={styles.logo}>
      <Logo style="logoSmall">Rate.io</Logo>
    </div>
  );
}
