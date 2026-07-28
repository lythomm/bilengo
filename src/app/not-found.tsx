import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-900 p-4 text-center">
      <h2 className="text-2xl font-bold font-heading mb-2">Page introuvable</h2>
      <p className="text-xs text-neutral-500 mb-6">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-md hover:bg-neutral-800 transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
