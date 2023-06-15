"use client";
import React, { useState } from "react";

// Material UI Components
import { Grid, Paper, TextField, Typography, Box, Button } from "@mui/material";
import Logo from "../../components/Logo/Logo";

// Local components
import FriendList from "../../components/FriendList/FriendList";

const content = {
  title: "Criando",
  subtitle: "Dê um nome ao seu rateio e convide amigos!",
  form: {
    textField: {
      id: "outlined-basic",
      variant: "outlined",
      size: "medium",
      fullWidth: true,

      textContent: [
        { label: "Título", placeholder: "exemplo: Rateio de @username" },
      ],
    },
    button: {
      endIcon: "🎉",
      buttonVariant: "outlined",
      buttonText: "Começar Rateio",
    },
  },
};

export default function NewRateio() {
  const { title, subtitle } = content;
  const { id, variant, size, fullWidth } = content.form.textField;
  const { label, placeholder } = content.form.textField.textContent[0];
  const { endIcon, buttonVariant, buttonText } = content.form.button;
  const [friends, setFriends] = useState([]);
  const [rateioTitle, setRateioTitle] = useState(undefined);
  return (
    <>
      <Typography
        fontWeight={"bold"}
        variant="display"
        sx={{ marginBottom: "1rem" }}
      >
        {title} <Logo size="large" />
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{ marginBottom: "3rem" }}
      >
        {subtitle}
      </Typography>

      <Paper
        sx={{ minWidth: "600px" }}
        variant="outlined"
      >
        <Grid
          justifyContent="center"
          alignItems="center"
          padding={5}
        >
          <Grid item>
            <TextField
              sx={{ marginBottom: "2rem" }}
              required
              id={id}
              label={label}
              variant={variant}
              size={size}
              fullWidth={fullWidth}
              placeholder={placeholder}
              onChange={(e) => {
                setRateioTitle(e.target.value);
              }}
            />
          </Grid>

          <Grid item>
            <FriendList users={(value) => setFriends(value)} />
          </Grid>

          <Grid
            paddingTop={5}
            item
            textAlign={"center"}
          >
            <Button
              onClick={() => console.log({ rateioTitle, friends })}
              endIcon={endIcon}
              variant={buttonVariant}
              size="large"
            >
              {buttonText}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
