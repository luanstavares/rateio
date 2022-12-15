import * as styles from "./Logo.module.scss";
import React from "react";

export default function Logo({ style, children }) {
  function styleClass() {
    switch (style) {
      case "logoSmall":
        return styles.logoSmall;
      case "logoLarge":
        return styles.logoLarge;
      case "logoExtraLarge":
        return styles.logoExtraLarge;
      case "logoMedium":
      default:
        return styles.logoMedium;
    }
  }
  function logoClass() {
    return `${styleClass()}`;
  }

  return <span className={logoClass()}>{children}</span>;
}
