import React from "react";
import SidebarBarWrapper from "../../../shared/components/sidebar"; // ✅ Adjust path if needed

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex bg-black min-h-screen h-full">
      {/* Sidebar */}
      <aside className="w-[280px] min-w-[250px] max-w-[300px] border-r border-gray-700 text-white p-4">
        <div className="sticky top-0">
          <SidebarBarWrapper />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1">
        <div className="overflow-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
