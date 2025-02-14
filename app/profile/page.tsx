"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../lib/authContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useState, useEffect } from "react";
import { getFavorites, removeFavorite } from "../lib/firestore";

const Profile = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);

  useEffect(() => {
    // Ne pas oublier de vérifier si l'utilisateur est authentifié avant de récupérer les favoris
    if (user) {
      const fetchFavorites = async () => {
        setLoadingFavorites(true);
        const fetchedFavorites = await getFavorites(user.uid); // Récupère les favoris en fonction de l'UID de l'utilisateur
        setFavorites(fetchedFavorites);
        setLoadingFavorites(false);
      };
      fetchFavorites();
    }
  }, [user]); // Le useEffect dépend de la connexion de l'utilisateur

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

  const handleRemoveFavorite = async (movie) => {
    await removeFavorite(user.uid, movie); // Retirer le film des favoris dans Firestore
    setFavorites(favorites.filter((favMovie) => favMovie.id !== movie.id)); // Mise à jour de l'état local
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

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Films favoris</h3>
          {loadingFavorites ? (
            <div>Chargement des favoris...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.length === 0 ? (
                <div className="col-span-full text-center text-lg">
                  Aucun favori trouvé
                </div>
              ) : (
                favorites.map((movie) => {
                  if (!movie.id || !movie.title || !movie.poster_path) {
                    return (
                      <div
                        key={movie.id || Math.random()}
                        className="text-center"
                      >
                        <p>Film invalide ou incomplet</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={movie.id}
                      className="border rounded-lg overflow-hidden shadow-lg text-white"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-96 object-cover text-white"
                      />
                      <div className="p-4">
                        <h2 className="text-xl font-bold text-white">
                          {movie.title}
                        </h2>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(movie)}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        Retirer des favoris
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
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
