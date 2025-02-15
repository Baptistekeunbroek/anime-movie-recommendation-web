import React, { useEffect, useState } from "react";
import { getFavorites, getLikedMovies } from "../lib/firestore";
import { fetchRecommendedMovies, fetchMovies } from "../lib/tmdb";
import { Movie } from "../type/types";
import { useAuth } from "../lib/authContext";
import { addFavorite } from "../lib/firestore";
import Link from "next/link"; // Import de Link pour la navigation entre les pages

const MoviesList = () => {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]); // Pour les résultats de la recherche
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]); // Suggestions en temps réel

  const { user } = useAuth();

  // Fonction pour récupérer les favoris et les recommandations
  useEffect(() => {
    if (user) {
      const fetchFavoritesAndRecommendations = async () => {
        setLoading(true);
        const fetchedFavorites = await getFavorites(user.uid);
        const fetchedLikes = await getLikedMovies(user.uid);
        setFavorites(fetchedFavorites);

        if (fetchedFavorites.length > 0) {
          const recommendations = await fetchRecommendedMovies(
            fetchedFavorites,
            fetchedLikes
          );
          setRecommendedMovies(recommendations);
        } else {
          console.log("Aucun genre trouvé dans les favoris");
        }

        setLoading(false);
      };
      fetchFavoritesAndRecommendations();
    }
  }, [user]);

  // Fonction pour rechercher des films en temps réel pendant la saisie
  const handleSearchInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const data = await fetchMovies(query);
      setSuggestions(data); // Mettre à jour les suggestions
    } else {
      setSuggestions([]); // Réinitialiser si la recherche est vide
    }
  };

  // Fonction pour ajouter un film aux favoris
  const handleAddFavorite = (movie: Movie) => {
    addFavorite(movie);
  };

  // Fonction pour rechercher des films au clic sur "Rechercher"
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const data = await fetchMovies(searchQuery);
      setSearchResults(data);
    } else {
      setSearchResults([]); // Réinitialiser si la recherche est vide
    }
  };

  // Fonction pour gérer la sélection d'une suggestion
  const handleSelectSuggestion = (movie: Movie) => {
    setSearchQuery(movie.title); // Mettre le titre du film dans la barre de recherche
    setSuggestions([]); // Réinitialiser les suggestions
    setSearchResults([movie]); // Afficher le film sélectionné dans les résultats
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-6 text-center relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="px-4 py-2 rounded-lg text-black"
          placeholder="Rechercher un film"
        />
        <button
          onClick={handleSearch}
          className="ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Rechercher
        </button>

        {/* Afficher les suggestions pendant la saisie */}
        {suggestions.length > 0 && searchQuery.trim() && (
          <div className="absolute bg-gray-800 w-full mt-2 rounded-lg">
            {suggestions.map((movie) => (
              <div
                key={movie.id}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectSuggestion(movie)} // Ajouter le gestionnaire de clic
              >
                {movie.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Affichage des résultats de recherche si la recherche a été effectuée */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mt-6 mb-4">
            Résultats de recherche
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                className="rounded-lg overflow-hidden shadow-lg text-white relative group"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-96 object-cover text-white"
                />
                <Link href={`/movies/${movie.id}`} passHref>
                  <button className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Voir détails
                  </button>
                </Link>

                <button
                  onClick={() => handleAddFavorite(movie)}
                  className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Ajouter aux favoris
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-6">Nos Recommandations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Affichage des recommandations */}
        {recommendedMovies.map((movie) => (
          <div
            key={movie.id}
            className="rounded-lg overflow-hidden shadow-lg text-white relative group"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-96 object-cover text-white"
            />
            <Link href={`/movies/${movie.id}`} passHref>
              <button className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Voir détails
              </button>
            </Link>

            <button
              onClick={() => handleAddFavorite(movie)}
              className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Ajouter aux favoris
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoviesList;
