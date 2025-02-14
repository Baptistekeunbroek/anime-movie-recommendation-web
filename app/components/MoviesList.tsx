import React, { useEffect, useState } from "react";
import { getFavorites } from "../lib/firestore";
import { fetchRecommendedMovies } from "../lib/tmdb";
import { Movie } from "../type/types";
import { useAuth } from "../lib/authContext";

import { addFavorite } from "../lib/firestore";

const MoviesList = () => {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<any[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        setLoading(true);
        const fetchedFavorites = await getFavorites(user.uid);
        setFavorites(fetchedFavorites);

        if (fetchedFavorites.length > 0) {
          const recommendations = await fetchRecommendedMovies(
            fetchedFavorites
          );
          setRecommendedMovies(recommendations);
        } else {
          console.log("Aucun genre trouvé dans les favoris");
        }

        setLoading(false);
      };
      fetchFavorites();
    }
  }, [user]);

  const handleAddFavorite = (movie: {
    id: number;
    title: string;
    poster_path: string;
  }) => {
    addFavorite(movie);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {recommendedMovies.map((movie) => (
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
            <h2 className="text-xl font-bold">{movie.title}</h2>
            <p className="text-white text-sm">
              {movie.overview.slice(0, 100)}...
            </p>
          </div>
          <button
            onClick={() => handleAddFavorite(movie)}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Ajouter aux favoris
          </button>
        </div>
      ))}
    </div>
  );
};

export default MoviesList;
