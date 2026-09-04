import { Button } from "./components/ui/button";

// Icons
import { User } from "phosphor-react";

export default function UserMenu() {
  return (
    <Button aria-label="Abrir usuário" size="icon" variant="ghost" type="button">
      <User />
    </Button>
  );
}
