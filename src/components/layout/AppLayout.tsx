import { Protected } from "@/lib/protected-page";
import { Outlet } from "react-router";
import { Fab } from "../shared/Fab";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <Protected>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-64 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
        <Fab />
      </div>
    </Protected>
  );
}
