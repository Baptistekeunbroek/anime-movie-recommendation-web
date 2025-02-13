// pages/register.tsx
"use client"; // Directive pour marquer ce fichier comme composant client-side

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Assurez-vous d'importer depuis "next/navigation"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase"; // Assure-toi que l'import de 'auth' est correct

const Register = () => {
  const router = useRouter(); // Initialisation du router pour la redirection

  useEffect(() => {
    const provider = new GoogleAuthProvider();

    const handleGoogleSignIn = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        // L'utilisateur est connecté via Google
        const user = result.user;
        console.log("Utilisateur connecté:", user);

        // Redirection vers la page d'accueil ou une autre page après inscription
        router.push("/"); // Change cette route si nécessaire
      } catch (error) {
        console.error("Erreur lors de la connexion avec Google:", error);
      }
    };

    // Appelle cette fonction lors du clic sur le bouton
    const googleLoginButton = document.getElementById("google-login-button");
    googleLoginButton?.addEventListener("click", handleGoogleSignIn);

    return () => {
      googleLoginButton?.removeEventListener("click", handleGoogleSignIn);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Inscription</h1>
        <p className="text-center text-gray-500 mb-4">
          Inscrivez-vous avec votre compte Google
        </p>
        <button
          id="google-login-button"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
};

export default Register;
