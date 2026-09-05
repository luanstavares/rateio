// Icons
import { List } from "phosphor-react";

import DrawerMenu from "./drawer-menu";
import MenuList from "./menu-list";

export default function BurgerMenu() {
  return (
    <DrawerMenu
      anchor="left"
      content={<MenuList />}
      icon={<List aria-hidden="true" />}
    />
  );
}
