"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (step === "signUp") {
        await signIn("password", {
          email,
          password,
          name,
          phone,
          flow: "signUp",
        });
      } else {
        await signIn("password", {
          email,
          password,
          flow: "signIn",
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Identifiants invalides ou erreur lors de l'authentification."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {step === "signIn"
              ? "Connexion Organisateur"
              : "Créer un compte Organisateur"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "signUp" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nom / Prénom
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alexandre Dupont"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organisateur@exemple.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold transition-colors duration-200 disabled:opacity-50"
          >
            {loading
              ? "Patientez..."
              : step === "signIn"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {step === "signIn" ? (
            <p>
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setStep("signUp");
                  setError(null);
                }}
                className="text-amber-400 hover:underline font-medium"
              >
                Inscrivez-vous
              </button>
            </p>
          ) : (
            <p>
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setStep("signIn");
                  setError(null);
                }}
                className="text-amber-400 hover:underline font-medium"
              >
                Connectez-vous
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
