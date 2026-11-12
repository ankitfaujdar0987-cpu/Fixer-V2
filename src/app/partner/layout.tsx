import AccountShell from "@/components/AccountShell";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountShell>{children}</AccountShell>;
}