import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vision Boards",
  description: "Create and manage your vision boards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>
        <div className="flex h-screen bg-base-100">
          {/* Sidebar */}
          <aside className="w-64 bg-base-200 text-base-content">
            <div className="p-4">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🖼️</span> Vision Boards
              </h1>
            </div>
            <nav className="p-4">
              <h2 className="text-lg font-semibold mb-2">Manage</h2>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/gallery"
                    className="flex items-center gap-2 hover:bg-base-300 p-2 rounded"
                  >
                    <span className="text-xl">🖼️</span> Gallery
                  </a>
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>
                      <a
                        href="#"
                        className="flex items-center gap-2 hover:bg-base-300 p-2 rounded"
                      >
                        📁 Albums
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center gap-2 hover:bg-base-300 p-2 rounded"
                      >
                        ❤️ Favorites
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a
                    href="/boards"
                    className="flex items-center gap-2 hover:bg-base-300 p-2 rounded"
                  >
                    <span className="text-xl">📌</span> Boards
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
