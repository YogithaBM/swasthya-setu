"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import TopNav from "@/components/TopNav";
import PublicNav from "@/components/PublicNav";
import {
  applyThemeClass,
  getTheme,
} from "@/lib/theme";
import {
  canAccess,
  clearRole,
  getRole,
  PUBLIC_PATHS,
  roleHome,
  type Role,
} from "@/lib/auth";
import type { Language } from "@/lib/translations";

/**
 * Client shell that owns role-based access for the whole app:
 * - Not logged in → every route except /login redirects to /login.
 * - Logged in → route must be allowed for the role, otherwise /access-denied.
 * - Renders the top nav (with role-aware links + logout) only on authed pages.
 */
export default function AppShell({
  lang,
  children,
}: {
  lang: Language;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Ensure <html class="dark"> matches storage even if the boot script
    // didn't run (e.g. client-side navigation from an external entry).
    applyThemeClass(getTheme());

    const current = getRole();
    setRole(current);

    if (!current) {
      // Not logged in — public routes only; everything else goes to /login.
      if (!PUBLIC_PATHS.includes(pathname)) {
        router.replace("/login");
        return;
      }
    } else if (pathname === "/login") {
      // Already logged in — skip the login page.
      router.replace(roleHome(current));
      return;
    } else if (!canAccess(current, pathname)) {
      router.replace("/access-denied");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-brand-tint" />
        <div className="skeleton h-3 w-32" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  const showNav = pathname !== "/login" && pathname !== "/access-denied";

  return (
    <>
      {showNav &&
        (role ? (
          <TopNav
            lang={lang}
            role={role}
            onLogout={() => {
              clearRole();
              try {
                window.localStorage.removeItem("swasthya_user");
              } catch {}
              // Return to the public homepage after logging out.
              router.replace("/");
            }}
          />
        ) : (
          // Public visitor nav on the open homepage (no role stored).
          <PublicNav lang={lang} />
        ))}
      <main className={showNav ? "min-w-0 pt-20" : "min-w-0"}>{children}</main>
    </>
  );
}