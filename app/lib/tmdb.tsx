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

export const fetchMovieDetails = async (movieId: number) => {
  console.log(`Fetching details for movie ID: ${movieId}`); // Ajout d'un log ici pour vérifier l'appel
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
  );
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des détails du film");
  }
  return await response.json();
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

const fetchMovieCredits = async (movieId: number) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/credits`,
      { params: { api_key: API_KEY } }
    );

    const cast = response.data.cast.slice(0, 5).map((actor) => actor.name);
    const director =
      response.data.crew.find((crew) => crew.job === "Director")?.name ||
      "Inconnu";

    return { cast, director };
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des crédits du film ${movieId}:`,
      error
    );
    return { cast: [], director: "Inconnu" };
  }
};

export const fetchRecommendedMovies = async (
  userFavorites: Movie[],
  userLikes: Movie[]
) => {
  try {
    console.log("Favorites récupérés depuis Firestore:", userFavorites);
    console.log("Likes récupérés depuis Firestore:", userLikes);

    const allMovies = [...userFavorites, ...userLikes].filter(
      (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
    );

    // Récupérer les crédits des films (acteurs + réalisateurs)
    const moviesWithCredits = await Promise.all(
      allMovies.map(async (movie) => {
        const credits = await fetchMovieCredits(movie.id);
        return { ...movie, cast: credits.cast, director: credits.director };
      })
    );

    console.log("Films avec crédits:", moviesWithCredits);

    // Extraction des genres, acteurs et réalisateurs
    const genreIds = moviesWithCredits.flatMap((movie) => movie.genre_ids);
    const actorNames = moviesWithCredits.flatMap((movie) => movie.cast || []);
    const directorNames = moviesWithCredits
      .map((movie) => movie.director)
      .filter(Boolean);

    if (genreIds.length === 0) {
      console.log("Aucun genre trouvé, annulation de la requête.");
      return [];
    }

    // Calculer les éléments les plus fréquents
    const mostFrequentGenres = Object.entries(
      genreIds.reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id]) => id);

    const mostFrequentActors = Object.entries(
      actorNames.reduce(
        (acc, name) => ({ ...acc, [name]: (acc[name] || 0) + 1 }),
        {}
      )
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => name);

    const mostFrequentDirectors = Object.entries(
      directorNames.reduce(
        (acc, name) => ({ ...acc, [name]: (acc[name] || 0) + 1 }),
        {}
      )
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1)
      .map(([name]) => name);

    console.log("Genres les plus fréquents:", mostFrequentGenres);
    console.log("Acteurs les plus fréquents:", mostFrequentActors);
    console.log("Réalisateurs les plus fréquents:", mostFrequentDirectors);

    // Construire les requêtes TMDB
    const params = {
      api_key: API_KEY,
      with_genres: mostFrequentGenres.join(","),
      //with_cast: mostFrequentActors.join(","),
      //with_crew: mostFrequentDirectors.join(","),
      page: 1,
      vote_count_gte: 500,
      include_adult: false,
      include_video: false,
    };

    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie`,
      { params }
    );
    console.log("Films recommandés:", response.data.results);

    // Filtrer les films bien notés
    const filteredResults = response.data.results.filter(
      (movie) => movie.vote_average >= 7
    );

    return filteredResults;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des films recommandés:",
      error
    );
    return [];
  }
};
