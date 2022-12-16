import * as styles from "./Text.module.scss";

export default function Text({ mode, style, children }) {
  function styleClass() {
    switch (style) {
      case "text__title":
        return styles.text__title;
      case "text__h1":
        return styles.text__h1;
      case "text__h2":
        return styles.text__h2;
      case "text__h3":
        return styles.text__h3;
      case "text__h4":
        return styles.text__h4;
      case "text__h5":
        return styles.text__h5;
      case "text__body__small__regular":
        return styles.text__body__small__regular;
      case "text__body__small__semi__bold":
        return styles.text__body__small__semi__bold;
      case "text__body__large__semi__bold":
        return styles.text__body__large__semi__bold;
      case "text__body__large__regular":
      default:
        return styles.text__body__large__regular;
    }
  }

  function modeClass() {
    switch (mode) {
      case "link":
        return styles.text__link;
      default:
        return "";
    }
  }

  function textClass() {
    return `${styleClass()} ${modeClass()}`;
  }

  return <span className={textClass()}>{children}</span>;
}
