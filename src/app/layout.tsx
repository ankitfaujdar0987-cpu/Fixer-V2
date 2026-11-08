import type { Metadata } from "next";
import { Figtree, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
 
// Body text font
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});
 
// Headings font
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
 
export const metadata: Metadata = {
  title: "Fixer – Trusted help at your door",
  description:
    "Book verified electricians, plumbers, tutors and more near you.",
};
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${bricolage.variable}`}>
      <body className="bg-white font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}