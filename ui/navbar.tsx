import Link from "next/link";

//Local Components
import BurgerMenu from "./burger-menu";
import Logo from "./logo";
import UserMenu from "./user-menu";

export default function Navbar() {
    return (
        <nav className="sticky inset-x-0 top-0 z-10 flex h-25 items-center justify-around">
            <Link href="/">
                <Logo glow="active" />
            </Link>
            <BurgerMenu />
            <UserMenu />
        </nav>
    );
}
