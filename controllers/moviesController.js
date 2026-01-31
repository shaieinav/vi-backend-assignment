import logger from '../utils/logger.js';

/**
 * Factory function to create a movies controller.
 * Uses dependency injection for testability and flexibility.
 * @param {import('../services/movieDataService.js').MovieDataService} movieDataService
 * @returns {Object} Controller with route handlers
 */
export function createMoviesController(movieDataService) {
    return {
        /**
         * GET /moviesPerActor
         * Returns which Marvel movies each actor played in.
         */
        async getMoviesPerActor(_req, res) {
            try {
                const data = await movieDataService.getMoviesPerActor();
                res.json(data);
            } catch (error) {
                logger.error({ err: error }, 'Error in getMoviesPerActor');
                res.status(500).json({ error: 'Failed to fetch movie data' });
            }
        },

        /**
         * GET /actorsWithMultipleCharacters
         * Returns actors who played more than one Marvel character.
         */
        async getActorsWithMultipleCharacters(_req, res) {
            try {
                const data = await movieDataService.getActorsWithMultipleCharacters();
                res.json(data);
            } catch (error) {
                logger.error({ err: error }, 'Error in getActorsWithMultipleCharacters');
                res.status(500).json({ error: 'Failed to fetch movie data' });
            }
        },

        /**
         * GET /charactersWithMultipleActors
         * Returns characters that were played by more than one actor.
         */
        async getCharactersWithMultipleActors(_req, res) {
            try {
                const data = await movieDataService.getCharactersWithMultipleActors();
                res.json(data);
            } catch (error) {
                logger.error({ err: error }, 'Error in getCharactersWithMultipleActors');
                res.status(500).json({ error: 'Failed to fetch movie data' });
            }
        }
    };
}
