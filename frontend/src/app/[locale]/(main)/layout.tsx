import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Inter, Orbitron } from "next/font/google";

// Initialize the fonts
const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-orbitron",
});

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen relative">
        <div className="relative z-10 flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 py-20 ps-28 pe-16 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
  );
}
