'use client';
import type { ReactNode } from 'react';
import { useState } from 'react';

import {
  ArrowRightIcon,
  HouseLineIcon,
  PlusCircleIcon,
  UserIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { Button } from './components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './components/ui/drawer';

type DrawerMenuProps = {
  anchor: 'left' | 'right';
  icon: ReactNode;
};

const navigationItems = [
  { href: '/', label: 'Início', icon: <HouseLineIcon /> },
  { href: '/rateios', label: 'Meus rateios', icon: <UsersThreeIcon /> },
  { href: '/rateios/novo', label: 'Novo rateio', icon: <PlusCircleIcon /> },
  {
    href: '/rateios/entrar',
    label: 'Entrar em rateio',
    icon: <ArrowRightIcon />,
  },
] as const;

const myAccount = { href: '/conta', label: 'Minha conta', icon: <UserIcon /> };

export default function DrawerMenu({ anchor, icon }: DrawerMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer direction={anchor} open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button aria-label="Abrir menu" size="icon" variant="outline">
          {icon}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerDescription>Navegação principal do Rate.io</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 gap-2 flex flex-col">
          {navigationItems.map((item) => (
            <Link href={item.href} key={item.label}>
              <Button
                size={'lg'}
                variant={'outline'}
                className="w-full text-left justify-start"
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        <DrawerFooter>
          <Link href={myAccount.href} key={myAccount.label}>
            <Button
              size={'sm'}
              variant={'default'}
              className="w-full"
              onClick={() => setOpen(false)}
            >
              {myAccount.icon}
              {myAccount.label}
            </Button>
          </Link>
          <DrawerClose asChild>
            <Button className="w-full" type="button" variant="ghost">
              Fechar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
