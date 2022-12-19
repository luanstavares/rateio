import * as styles from "./Logo.module.scss";
import React from "react";

export default function Logo({ style, size = 'medium' }) {
  function styleClass() {
    const baseClass = `logo`;
    const sizeClass = `logo--${size}`;

    return [styles[baseClass], styles[sizeClass]].join(' ');
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

  return <span className={styleClass()}>Rate.io</span>;
}
