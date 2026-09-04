import { Button } from "./components/ui/button";

// Icons
import { List } from "phosphor-react";

export default function BurgerMenu() {
  return (
    <Button aria-label="Abrir menu" size="icon" variant="ghost" type="button">
      <List />
    </Button>
  );
}
