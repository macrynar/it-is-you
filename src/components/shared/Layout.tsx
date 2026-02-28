/**
 * Layout.tsx — Universal page wrapper: Navbar + page content + Footer.
 *
 * Usage (in App.jsx routes):
 *   <Layout isAuthenticated={!!user} activeLink="tests">
 *     <SomePage />
 *   </Layout>
 *
 * For pages that manage their own theme toggle (e.g. CharacterSheet),
 * render <Navbar> directly inside the page component instead.
 */
import type { ReactNode } from 'react';
import Navbar, { type NavbarProps } from './Navbar';
import Footer from './Footer';

interface LayoutProps extends NavbarProps {
  children: ReactNode;
  /** Omit the footer (e.g. full-screen test wizard) */
  noFooter?: boolean;
  /** Omit the navbar (page manages its own, e.g. CharacterSheet with theme toggle) */
  noNav?: boolean;
}

export default function Layout({
  children,
  isAuthenticated = false,
  activeLink,
  theme,
  onThemeToggle,
  noFooter = false,
  noNav = false,
}: LayoutProps) {
  return (
    <>
      {!noNav && (
        <Navbar
          isAuthenticated={isAuthenticated}
          activeLink={activeLink}
          theme={theme}
          onThemeToggle={onThemeToggle}
        />
      )}
      {children}
      {!noFooter && <Footer />}
    </>
  );
}
