import React from "react";
import DrawerMenu from "../DrawerMenu/DrawerMenu";

import { List } from "phosphor-react";

export default function BurgerMenu() {
  return (
    <>
      <DrawerMenu
        content={<p>test burger menu</p>}
        anchor="left"
        icon={<List />}
      />
    </>
  );
}
