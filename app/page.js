"use client";
import React from "react";

import Link from "next/link";

// Material UI Components
import {
  Grid,
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// Local Components
import Logo from "../components/Logo/Logo";
import Drawings from "../components/Drawings/Drawings";

// Icons
import { ArrowRight, UsersThree } from "phosphor-react";

const mainContent = {
  title: "Bem vindo ao",
  subtitle: "O app que te ajuda a dividir a conta entre amigos.",
  options: [
    {
      title: "Novo Rateio",
      subtitle: "Crie um novo rateio e convide seus amigos.",
      icon: <UsersThree />,
    },
    {
      title: "Entrar em um rateio existente",
      subtitle: "Entre em um rateio já existente.",
      icon: <ArrowRight />,
    },
  ],
};

// Metadata
const metadata = {
  title: "Rate.io",
  description: "O app que te ajuda a dividir a conta entre amigos.",
  author: "Luan Tavares",
};

export default function Home() {
  const { title, subtitle, options } = mainContent;
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isXs = useMediaQuery(theme.breakpoints.up("xs"));

  return (
    <>
      <Drawings />

      <Grid item>
        <Box textAlign="center">
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            spacing={1}
            direction="column"
          >
            <Grid item>
              <Typography
                fontWeight={"bold"}
                variant="h1"
              >
                {title} <Logo size={isSm ? "medium" : "small"} />
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant={isSm ? "subtitle1" : "subtitle2"}>
                {subtitle}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Box>
        <Grid
          marginTop={"4rem"}
          container
          direction={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          spacing={2}
        >
          {options.map((option, index) => {
            if (index === 0) {
              return (
                <Grid
                  key={option.title}
                  item
                >
                  <Link href="/new-rateio">
                    <Button
                      key={option.title}
                      color="primary"
                      variant="contained"
                      size="medium"
                      startIcon={option.icon}
                    >
                      {option.title}
                    </Button>
                  </Link>
                </Grid>
              );
            } else {
              return (
                <React.Fragment key={option.title}>
                  <Grid
                    key={option.title}
                    item
                  >
                    <Typography variant="subtitle1">ou</Typography>
                  </Grid>
                  <Grid item>
                    <Link href="/new-rateio">
                      <Button
                        color="primary"
                        variant="outlined"
                        size="medium"
                        endIcon={option.icon}
                      >
                        {option.title}
                      </Button>
                    </Link>
                  </Grid>
                </React.Fragment>
              );
            }
          })}
        </Grid>
      </Box>
    </>
  );
}
