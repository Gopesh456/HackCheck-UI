import "./styles.css";

export default function QuestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="dark-theme">{children}</section>;
}
