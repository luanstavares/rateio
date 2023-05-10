import Navbar from "../Navbar/Navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
