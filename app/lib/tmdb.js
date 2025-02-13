import axios from "axios";

// Récupérer la clé API TMDB depuis les variables d'environnement
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
});

export const fetchPopularMovies = async () => {
  try {
    const response = await api.get("movie/popular", {
      params: {
        api_key: API_KEY,
        language: "fr-FR",
      },
    });
    return response.data.results; // Retourne les films populaires
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des films populaires:",
      error
    );
    return [];
  }
};
