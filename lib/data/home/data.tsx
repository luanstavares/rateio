import { ArrowRightIcon, UsersThreeIcon } from "@phosphor-icons/react";

export const mainContent = () => {
  return {
    title: "Bem vindo ao",
    subtitle: "O app que te ajuda a dividir a conta entre amigos.",
    author: "Luan Tavares",
    options: [
      {
        title: "Novo Rateio",
        subtitle: "Crie um novo rateio e convide seus amigos.",
        href: "/rateios/novo",
        icon: <UsersThreeIcon />,
      },
      {
        title: "Entrar em rateio existente",
        subtitle: "Entre em um rateio já existente.",
        href: "/rateios/entrar",
        icon: <ArrowRightIcon />,
      },
    ],
  };
};
