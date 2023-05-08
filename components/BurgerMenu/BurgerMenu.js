import React from "react";

// Local components
import DrawerMenu from "../DrawerMenu/DrawerMenu";
import MenuList from "../MenuList/MenuList";

// Icons
import { List } from "phosphor-react";

export default function BurgerMenu() {
  return (
    <>
      <DrawerMenu
        content={<MenuList />}
        anchor="left"
        icon={<List />}
      />
    </>
  );
}
