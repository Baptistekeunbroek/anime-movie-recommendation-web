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
    if (user) {
      const fetchFavorites = async () => {
        setLoadingFavorites(true);
        const fetchedFavorites = await getFavorites(user.uid);
        setFavorites(fetchedFavorites);
        setLoadingFavorites(false);
      };
      fetchFavorites();
    }
  }, [user]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  // Fonction pour la déconnexion
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const handleRemoveFavorite = async (movie) => {
    await removeFavorite(user.uid, movie);
    setFavorites(favorites.filter((favMovie) => favMovie.id !== movie.id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Mon Profil</h1>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Informations</h2>
          <p className="text-lg">Nom : {user.displayName}</p>
          <p className="text-lg">Email : {user.email}</p>
          <div className="mt-8 text-center">
            <button
              onClick={handleSignOut}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Se Déconnecter
            </button>
          </div>
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
                      className=" rounded-lg overflow-hidden shadow-lg text-white relative group"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-96 object-cover"
                      />

                      <button
                        onClick={() => handleRemoveFavorite(movie)}
                        className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
      </div>
    </div>
  );
};

export default Profile;
