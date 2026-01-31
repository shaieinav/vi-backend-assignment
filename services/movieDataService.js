import {
    buildMoviesPerActor,
    buildActorsWithMultipleCharacters,
    buildCharactersWithMultipleActors
} from '../utils/dataProcessor.js';

/**
 * Service for fetching and processing Marvel movie data.
 * Uses dependency injection for flexibility and testability.
 */
export class MovieDataService {
    #cache = null;
    #fetchPromise = null;
    #tmdbService;
    #movies;
    #actorFilter;

    /**
     * @param {Object} options
     * @param {Object} options.tmdbService - TMDB API service with getAllMoviesCredits method
     * @param {Object.<string, number>} options.movies - Map of movie names to TMDB IDs
     * @param {string[]} options.actors - List of actor names to track
     */
    constructor({ tmdbService, movies, actors }) {
        this.#tmdbService = tmdbService;
        this.#movies = movies;
        this.#actorFilter = new Set(actors);
    }

    /**
     * Gets all processed data, fetching from TMDB if not cached.
     * Handles concurrent requests to prevent duplicate fetches.
     * @returns {Promise<Object>} Processed movie data
     */
    async #getProcessedData() {
        if (this.#cache) {
            return this.#cache;
        }

        if (this.#fetchPromise) {
            return this.#fetchPromise;
        }

        this.#fetchPromise = this.#fetchAndProcess();
        this.#cache = await this.#fetchPromise;
        this.#fetchPromise = null;

        return this.#cache;
    }

    /**
     * Fetches all movie credits and processes them into the three data structures.
     * @returns {Promise<Object>} Object containing all three processed data structures
     */
    async #fetchAndProcess() {
        const moviesArray = this.#getMoviesArray();
        const creditsData = await this.#tmdbService.getAllMoviesCredits(moviesArray);

        return {
            moviesPerActor: buildMoviesPerActor(creditsData, this.#actorFilter),
            actorsWithMultipleCharacters: buildActorsWithMultipleCharacters(creditsData, this.#actorFilter),
            charactersWithMultipleActors: buildCharactersWithMultipleActors(creditsData, this.#actorFilter)
        };
    }

    /**
     * Converts the movies object to an array format for the TMDB service.
     * @returns {Array<{name: string, id: number}>}
     */
    #getMoviesArray() {
        return Object.entries(this.#movies).map(([name, id]) => ({ name, id }));
    }

    /**
     * Gets the map of actors to movies they appeared in.
     * @returns {Promise<Object.<string, string[]>>}
     */
    async getMoviesPerActor() {
        const data = await this.#getProcessedData();
        return data.moviesPerActor;
    }

    /**
     * Gets actors who played multiple distinct characters.
     * @returns {Promise<Object.<string, Array<{movieName: string, characterName: string}>>>}
     */
    async getActorsWithMultipleCharacters() {
        const data = await this.#getProcessedData();
        return data.actorsWithMultipleCharacters;
    }

    /**
     * Gets characters played by multiple actors.
     * @returns {Promise<Object.<string, Array<{movieName: string, actorName: string}>>>}
     */
    async getCharactersWithMultipleActors() {
        const data = await this.#getProcessedData();
        return data.charactersWithMultipleActors;
    }
}
