'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, type ComponentProps } from 'react';

type GoogleSignInLinkProps = Omit<ComponentProps<'a'>, 'href'>;

function GoogleSignInLinkWithSearch({
  pathname,
  ...props
}: GoogleSignInLinkProps & { pathname: string }) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const returnTo = `${pathname}${query ? `?${query}` : ''}`;

  return (
    <a
      {...props}
      href={`/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`}
    />
  );
}

export default function GoogleSignInLink(props: GoogleSignInLinkProps) {
  const pathname = usePathname();

  return (
    <Suspense
      fallback={
        <a
          {...props}
          href={`/api/auth/google?returnTo=${encodeURIComponent(pathname)}`}
        />
      }
    >
      <GoogleSignInLinkWithSearch {...props} pathname={pathname} />
    </Suspense>
  );
}
