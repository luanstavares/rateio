import type { Metadata } from 'next';

import LandingPage from '../ui/landing/landing-page';

export const metadata: Metadata = {
  title: 'Rate.io | Bons momentos, contas divididas',
  description:
    'Do churrasco à viagem, organize as despesas com os amigos. Crie um rateio, convide por link e acompanhe os saldos em tempo real.',
};

export default function Home() {
  return <LandingPage />;
}
