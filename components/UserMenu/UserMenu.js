import React from "react";

// Local components
import DrawerMenu from "../DrawerMenu/DrawerMenu";
import UserList from "../UserList/UserList";

// Icons
import { User } from "phosphor-react";

export default function UserMenu() {
  return (
    <>
      <DrawerMenu
        content={<UserList />}
        anchor="right"
        icon={<User />}
      />
    </>
  );
}
