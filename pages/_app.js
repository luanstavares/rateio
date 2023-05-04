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
      display: {
        fontSize: 60,
      },
      h1: {
        fontSize: 49,
      },
      h2: {
        fontSize: 39,
      },
      h3: {
        fontSize: 31,
      },
      h4: {
        fontSize: 25,
      },
      h5: {
        fontSize: 20,
      },
      body1: { fontSize: 16 },
      body2: { fontSize: 14 },
      caption: {},
    },
    components: {
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            display: "h1",
          },
        },
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
