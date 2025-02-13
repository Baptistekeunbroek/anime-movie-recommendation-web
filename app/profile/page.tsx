// app/profile/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../lib/authContext"; // Assure-toi que le chemin est correct
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const Profile = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Si l'utilisateur est encore en cours de chargement
  if (loading) {
    return <p>Chargement...</p>;
  }

  // Si aucun utilisateur n'est connecté, rediriger vers la page de login
  if (!user) {
    router.push("/login");
    return null;
  }

  // Fonction pour la déconnexion
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Rediriger vers la page de login après déconnexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
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
    </div>
  );
};

export default Profile;
