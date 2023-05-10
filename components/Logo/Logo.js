import React from "react";

// Styles
import * as styles from "./Logo.module.scss";

export default function Logo({ size = "mini", glow = "disabled" }) {
  function styleClass() {
    const baseClass = `logo`;
    const sizeClass = `logo--${size}`;
    const glowClass = `logo__glow--${glow}`;

    return [styles[baseClass], styles[glowClass], styles[sizeClass]].join(" ");
  }

  return <span className={styleClass()}>Rate.io</span>;
}
