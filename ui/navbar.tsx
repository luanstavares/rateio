import Link from "next/link";

//Local Components
import BurgerMenu from "./burger-menu";
import Logo from "./logo";
import UserMenu from "./user-menu";

export default function Navbar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky inset-x-0 top-0 z-40 grid h-25 grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8"
    >
      <div className="justify-self-start">
        <BurgerMenu />
      </div>
      <Link
        href="/"
        aria-label="Rate.io, início"
        className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Logo glow="active" />
      </Link>
      <div className="justify-self-end">
        <UserMenu />
      </div>
    </nav>
  );
}
