import * as styles from "./Logo.module.scss";
import React from "react";

export default function Logo({ size = "medium" }) {
  function styleClass() {
    const baseClass = `logo`;
    const sizeClass = `logo--${size}`;

    return [styles[baseClass], styles[sizeClass]].join(" ");
  }

  return <span className={styleClass()}>Rate.io</span>;
}
