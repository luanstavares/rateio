import React from "react";

// Material UI Components
import { Grid, Button, Typography, Box } from "@mui/material";

// Local Components
import Logo from "../components/Logo/Logo";
import Illustration from "../components/Illustration/Illustration";
import HomeIcons from "../components/HomeIcons/HomeIcons";

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

export default function Home() {
  const { title, subtitle, options } = mainContent;

  return (
    <>
      <Illustration />
      <HomeIcons />
      <Grid
        height={"100vh"}
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item>
          <Box textAlign="center">
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              spacing={1}
              direction={"column"}
            >
              <Grid item>
                <Typography
                  fontWeight={"bold"}
                  variant="h1"
                >
                  {title} <Logo size="medium" />
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1">{subtitle}</Typography>
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
                    <Button
                      key={option.title}
                      color="primary"
                      variant="contained"
                      size="medium"
                      startIcon={option.icon}
                      onClick={() => window.alert("novo rateio")}
                    >
                      {option.title}
                    </Button>
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
                      <Button
                        color="primary"
                        variant="outlined"
                        size="medium"
                        endIcon={option.icon}
                        onClick={() =>
                          window.alert("entrar em rateio existente")
                        }
                      >
                        {option.title}
                      </Button>
                    </Grid>
                  </React.Fragment>
                );
              }
            })}
          </Grid>
        </Box>
      </Grid>
    </>
  );
}
