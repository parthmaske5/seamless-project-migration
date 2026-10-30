import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" && search["redirect"].startsWith("/") ? search["redirect"] : undefined,
  }),
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="bg-hero flex flex-1 items-start justify-center px-4 py-12 sm:px-6 md:py-16">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
