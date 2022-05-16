import * as styles from "./Text.module.scss";

export default function Text({ mode, size, weight, children }) {
  function sizeClass() {
    switch (size) {
      case "nano":
        return styles.textNano;
      case "small":
        return styles.textSmall;
      case "large":
        return styles.textLarge;
      case "giant":
        return styles.textGiant;
      case "title":
        return styles.textTitle;
      case "medium":
      default:
        return styles.textNormal;
    }
  }

  function weightClass() {
    switch (weight) {
      case "extra-light":
        return styles.textExtraLight;
      case "light":
        return styles.textLight;
      case "medium":
        return styles.textMedium;
      case "semi-bold":
        return styles.textSemiBold;
      case "bold":
        return styles.textBold;
      case "extra-bold":
        return styles.textExtraBold;
      case "regular":
      default:
        return styles.textRegular;
    }
  }

  function modeClass() {
    switch (mode) {
      case "link":
        return styles.textLink;
      case "logo":
        return styles.textLogo;
      default:
        return "";
    }
  }

  function textClass() {
    return `${weightClass()} ${sizeClass()} ${modeClass()}`;
  }

  return <span className={textClass()}>{children}</span>;
}
