import Navbar from "../components/Navbar/Navbar";
import Logo from "../components/Logo/Logo";
import { Grid, Button, Typography, Box } from "@mui/material";
/* import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded"; */

const mainContent = {
  title: "Bem vindo ao",
  subtitle: "O app que te ajuda a dividir a conta entre amigos.",
  options: [
    {
      title: "Novo Rateio",
      subtitle: "Crie um novo rateio e convide seus amigos.",
      icon: "ArrowForwardRoundedIcon",
    },
    {
      title: "Entrar em um rateio existente",
      subtitle: "Entre em um rateio já existente.",
      icon: "GroupsRoundedIcon",
    },
  ],
};

export default function Home() {
  const { title, subtitle, options } = mainContent;

  return (
    <>
      <Navbar />

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
                  <Grid item>
                    <Button
                      key={option.title}
                      color="primary"
                      variant="contained"
                      size="medium"
                      onClick={() => window.alert("novo rateio")}
                    >
                      {option.title}
                    </Button>
                  </Grid>
                );
              } else {
                return (
                  <>
                    <Grid item>
                      <Typography variant="subtitle1">ou</Typography>
                    </Grid>
                    <Grid item>
                      <Button
                        key={option.title}
                        color="primary"
                        variant="outlined"
                        size="medium"
                        onClick={() =>
                          window.alert("entrar em rateio existente")
                        }
                      >
                        {option.title}
                      </Button>
                    </Grid>
                  </>
                );
              }
            })}
          </Grid>
        </Box>
      </Grid>
    </>
  );
}
