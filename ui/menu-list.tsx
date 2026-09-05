import Link from "next/link";

const navigationItems = [
  { href: "/", label: "Início" },
  { href: "/rateios", label: "Meus rateios" },
  { href: "/rateios/novo", label: "Novo rateio" },
  { href: "/rateios/entrar", label: "Entrar em rateio" },
  { href: "/conta", label: "Minha conta" },
] as const;

export default function MenuList() {
  return (
    <nav aria-label="Navegação principal">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Menu
      </p>
      <ul className="space-y-1">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-3 text-lg transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
