import axios from "axios";
import { Movie } from "../type/types";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
});

export const fetchMovies = async (query: string) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&language=en-US&page=1`
    );
    return response.data.results;
  } catch (error) {
    console.error("Erreur lors de la recherche de films:", error);
    return [];
  }
};

export const fetchPopularMovies = async () => {
  try {
    const response = await api.get("movie/popular", {
      params: {
        api_key: API_KEY,
        language: "fr-FR",
      },
    });
    return response.data.results;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des films populaires:",
      error
    );
    return [];
  }
};

export const fetchRecommendedMovies = async (userFavorites: Movie[]) => {
  try {
    console.log("Favorites récupérés depuis Firestore:", userFavorites);

    const genreIds = userFavorites.flatMap((movie) => movie.genre_ids);
    console.log("Genres extraits des films favoris:", genreIds);

    if (genreIds.length === 0) {
      console.log("Aucun genre trouvé, annulation de la requête.");
      return [];
    }

    const genreFrequency: { [key: number]: number } = {};
    genreIds.forEach((id) => {
      genreFrequency[id] = (genreFrequency[id] || 0) + 1;
    });

    const mostFrequentGenres = Object.keys(genreFrequency)
      .sort((a, b) => genreFrequency[b] - genreFrequency[a])
      .slice(0, 2);

    console.log("Genres les plus fréquents:", mostFrequentGenres);

    const genreQuery = mostFrequentGenres.join(",");
    console.log("Genres envoyés à l'API:", genreQuery);

    const params = {
      api_key: API_KEY,
      with_genres: genreQuery,
      page: 1,
      vote_count_gte: 500,
      include_adult: false,
      include_video: false,
    };

    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie`,
      { params }
    );
    console.log("Films recommandés avec les filtres:", response.data.results);

    const filteredResults = response.data.results.filter(
      (movie) => movie.vote_average >= 7
    );
    console.log("Films après filtrage (note >= 7):", filteredResults);

    return filteredResults;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des films recommandés:",
      error
    );
    return [];
  }
};
