import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-6">
          🚀 Trading Dashboard
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Welcome to your professional trading dashboard. Manage trades and
          signals seamlessly.
        </p>
        <Link href="/trade-form">
          <button className="px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg transition duration-300 ease-in-out">
            Go to Trading Signal Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
