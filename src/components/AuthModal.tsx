"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      router.push("/dashboard");
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === "signIn"
          ? "Connexion Organisateur"
          : "Créer un compte Organisateur"
      }
      description={
        step === "signIn"
          ? "Connectez-vous pour gérer vos événements"
          : "Créez votre compte en quelques secondes"
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === "signUp" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Nom / Prénom
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexandre Dupont"
                className="cal-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="cal-input"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Adresse e-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="organisateur@exemple.com"
            className="cal-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="cal-input"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={loading}
          className="w-full mt-2"
        >
          {step === "signIn" ? "Se connecter" : "Créer mon compte"}
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-neutral-500">
        {step === "signIn" ? (
          <p>
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("signUp");
                setError(null);
              }}
              className="text-neutral-900 font-semibold hover:underline border-none bg-transparent cursor-pointer"
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
              className="text-neutral-900 font-semibold hover:underline border-none bg-transparent cursor-pointer"
            >
              Connectez-vous
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
}
