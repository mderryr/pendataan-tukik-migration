import Navbar from "@/components/another/navbar-all.component";
import Footer from "@/components/landing-page/footer.component";

// Halaman umum (beranda, login, daftar, dll.). Folder "(public)" tidak ikut ke URL.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
