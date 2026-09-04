import { ArrowRight, UsersThree } from "phosphor-react";

export const mainContent = () => {
  return {
    title: "Bem vindo ao",
    subtitle: "O app que te ajuda a dividir a conta entre amigos.",
    author: "Luan Tavares",
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
};
