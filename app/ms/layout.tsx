import React from 'react';
import RootShell, { rootMetadata, viewport } from '../../components/RootShell';

export const metadata = rootMetadata;
export { viewport };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="ms">{children}</RootShell>;
}
