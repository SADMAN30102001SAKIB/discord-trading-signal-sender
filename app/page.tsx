import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Trading Dashboard</h1>
      <p>
        <Link href="/trade-form">Go to Trading Signal Form</Link>
      </p>
    </div>
  );
}
