import * as styles from './Text.module.scss';

export default function Text({ size, weight, children }) {

  function sizeClass() {
    switch (size) {
      case 'nano':
        return styles.textNano;
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      case 'giant':
        return styles.textGiant;
      case 'medium':
      default:
        return styles.textMedium;
    }
  }

  function weightClass() {
    switch (weight) {
      case 'thin':
        return styles.Thin;
      case 'light':
        return styles.textLight;
      case 'semi-bold':
        return styles.textSemiBold;
      case 'bold':
        return styles.textBold;
      case 'normal':
      default:
        return styles.textNormal;
    }
  }

  function textClass() {
    return `${weightClass()} ${sizeClass()}`
  }

  return (
    <span
      className={textClass()}
    >
      { children }
    </span>
  );
}
