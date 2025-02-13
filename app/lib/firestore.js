import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

const getFavorites = async () => {
  const user = getAuth().currentUser;
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const favorites = userDoc.data().favorites || [];

      // On récupère les détails du film pour chaque favori (en utilisant l'ID)
      const fetchedFavorites = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${favorite.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            );
            const movieDetails = await response.json();

            if (movieDetails.title && movieDetails.poster_path) {
              return {
                id: favorite.id,
                title: movieDetails.title,
                poster_path: movieDetails.poster_path,
              };
            } else {
              console.error(
                `Détails du film manquants pour l'ID ${favorite.id}`
              );
              return null;
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération des détails du film:",
              error
            );
            return null;
          }
        })
      );

      // On filtre les films manquants
      const validFavorites = fetchedFavorites.filter(
        (favorite) => favorite !== null
      );

      console.log(validFavorites, "fetchedFavorites");

      return validFavorites;
    } else {
      console.log("Document utilisateur non trouvé");
      return [];
    }
  } else {
    console.log("Utilisateur non connecté");
    return [];
  }
};

const addFavorite = async (movie) => {
  const user = getAuth().currentUser;
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        favorites: [],
      });
    }

    // Ajoute l'objet film complet aux favoris
    await updateDoc(userRef, {
      favorites: arrayUnion({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      }),
    });

    console.log(`Film ${movie.title} ajouté aux favoris.`);
  } else {
    console.log("Utilisateur non connecté");
  }
};

const removeFavorite = async (uid, movie) => {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const favorites = userDoc.data().favorites || [];

    // Trouver l'objet complet du film avec l'ID correspondant
    const movieToRemove = favorites.find(
      (favMovie) => favMovie.id === movie.id
    );

    if (movieToRemove) {
      // Retirer l'objet complet des favoris
      await updateDoc(userRef, {
        favorites: arrayRemove(movieToRemove), // Utilise l'objet complet pour la suppression
      });

      console.log(`Film ${movie.id} retiré des favoris`);
    } else {
      console.log("Film introuvable dans les favoris");
    }
  } else {
    console.log("Utilisateur non connecté");
  }
};

export { getFavorites, addFavorite, removeFavorite };
