import React from "react";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import Footer from "@/shared/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-bg flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-8 lg:px-10 max-w-5xl mx-auto w-full flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
