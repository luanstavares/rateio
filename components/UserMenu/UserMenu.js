import React from "react";
import DrawerMenu from "../DrawerMenu/DrawerMenu";
import { User } from "phosphor-react";

export default function UserMenu() {
  return (
    <>
      <DrawerMenu
        content={<p>test user menu</p>}
        anchor="right"
        icon={<User />}
      />
    </>
  );
}
