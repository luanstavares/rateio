import "../styles/globals.scss";
import {
  createTheme,
  responsiveFontSizes,
  Paper,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

function MyApp({ Component, pageProps }) {
  let theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#ffad33",
        contrastText: "#000",
      },
      secondary: {
        main: "#ffcc80",
      },
    },
    typography: {
      fontFamily: `Signika Negative`,
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      button: {
        textTransform: "none",
        lineHeight: 1.5,
      },
    },
  });
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
