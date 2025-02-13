// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; // Import de l'auth Firebase

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Récupérer les infos de l'utilisateur
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUser(user);
    } else {
      // Si pas d'utilisateur, rediriger vers la page d'accueil
      router.push("/login");
    }
  }, [router]);

  // Fonction de déconnexion
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Rediriger vers la page de login après la déconnexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {user ? (
          <div>
            <h1 className="text-4xl font-bold mb-6">Mon Profil</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-2">Informations</h2>
              <p className="text-lg">Nom : {user.displayName}</p>
              <p className="text-lg">Email : {user.email}</p>
              <p className="text-lg">UID : {user.uid}</p>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleSignOut}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Se Déconnecter
              </button>
            </div>
          </div>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
