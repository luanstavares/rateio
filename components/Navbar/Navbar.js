import * as styles from "../Navbar/Navbar.module.scss";

import Logo from "../Logo/Logo";

export default function Navbar() {
  return (
    <div className={styles.navbar__logo}>
      <Logo glow="active">Rate.io</Logo>
    </div>
  );
}
