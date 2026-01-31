import 'dotenv/config';
import express from 'express';

// Data
import { movies, actors } from './data/marvelMovies.js';

// Services
import * as tmdbService from './services/tmdbService.js';
import { MovieDataService } from './services/movieDataService.js';

// Controller
import { createMoviesController } from './controllers/moviesController.js';

// Logger
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Composition root - assemble dependencies
const movieDataService = new MovieDataService({
    tmdbService,
    movies,
    actors
});

const moviesController = createMoviesController(movieDataService);

// Routes
app.get('/moviesPerActor', moviesController.getMoviesPerActor);
app.get('/actorsWithMultipleCharacters', moviesController.getActorsWithMultipleCharacters);
app.get('/charactersWithMultipleActors', moviesController.getCharactersWithMultipleActors);

// Start server
app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server is running');
});
