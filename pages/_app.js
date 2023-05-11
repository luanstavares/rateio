import Head from "next/head";

import "../styles/globals.scss";
import {
  createTheme,
  responsiveFontSizes,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import Layout from "../components/Layouts/MainLayout";

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
      caption1: { fontSize: 12 },
      caption2: { fontSize: 10 },
    },
    components: {
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            display: "h1",
            caption1: "body1",
            caption2: "body2",
          },
        },
      },
    },
  });
  theme = responsiveFontSizes(theme);

  return (
    <>
      <Head>
        <title>rate.io</title>
        <link
          rel="icon"
          href="/favicon.svg"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <Layout>
          <CssBaseline />

          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
