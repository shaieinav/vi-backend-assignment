import axios from 'axios';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = process.env.TMDB_BASE_URL;

/**
 * Fetches the cast and crew credits for a movie
 * @param {number} movieId - The TMDB movie ID
 * @returns {Promise<{cast: Array, crew: Array}>} The movie credits
 */
export async function getMovieCredits(movieId) {
    if (!API_KEY || !BASE_URL) {
        throw new Error('TMDB_API_KEY and TMDB_BASE_URL environment variables must be set');
    }

    const url = `${BASE_URL}/movie/${movieId}/credits`;

    const response = await axios.get(url, {
        params: { api_key: API_KEY }
    });

    return response.data;
}

/**
 * Fetches credits for multiple movies in parallel
 * @param {Array<{name: string, id: number}>} movies - Array of movie objects with name and id
 * @returns {Promise<Array<{movieName: string, credits: Object}>>} Credits for each movie
 */
export async function getAllMoviesCredits(movies) {
    const results = await Promise.all(
        movies.map(async ({ name, id }) => {
            const credits = await getMovieCredits(id);
            return { movieName: name, credits };
        })
    );

    return results;
}
