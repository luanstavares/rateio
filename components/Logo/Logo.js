import * as styles from "./Logo.module.scss";
import React from "react";

export default function Logo({ style }) {
  function styleClass() {
    switch (style) {
      case "logo__small":
        return styles.logo__small;
      case "logo__large":
        return styles.logo__large;
      case "logo__extra__large":
        return styles.logo__extra__large;
      case "logo__medium":
      default:
        return styles.logo__medium;
    }
  }
  function logoClass() {
    return `${styleClass()}`;
  }

  return <span className={logoClass()}>Rate.io</span>;
}
