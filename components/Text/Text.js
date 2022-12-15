import * as styles from "./Text.module.scss";

export default function Text({ mode, style, children }) {
  function styleClass() {
    switch (style) {
      case "title":
        return styles.textTitle;
      case "h1":
        return styles.textH1;
      case "h2":
        return styles.textH2;
      case "h3":
        return styles.textH3;
      case "h4":
        return styles.textH4;
      case "h5":
        return styles.textH5;
      case "body-small-regular":
        return styles.bodySmallRegular;
      case "body-small-semi-bold":
        return styles.bodySmallSemiBold;
      case "body-large-semi-bold":
        return styles.bodyLargeSemiBold;
      case "body-large-regular":
      default:
        return styles.bodyLargeRegular;
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
    return `${styleClass()} ${modeClass()}`;
  }

  return <span className={textClass()}>{children}</span>;
}
