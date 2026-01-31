import { jest } from '@jest/globals';
import { MovieDataService } from '../services/movieDataService.js';

describe('MovieDataService', () => {
    // Mock TMDB service
    const mockCreditsResponse = [
        {
            movieName: 'Iron Man',
            credits: {
                cast: [
                    { name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man' },
                    { name: 'Gwyneth Paltrow', character: 'Pepper Potts' }
                ]
            }
        },
        {
            movieName: 'The Avengers',
            credits: {
                cast: [
                    { name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man' },
                    { name: 'Chris Evans', character: 'Steve Rogers / Captain America' },
                    { name: 'Scarlett Johansson', character: 'Natasha Romanoff / Black Widow' }
                ]
            }
        },
        {
            movieName: 'Fantastic Four',
            credits: {
                cast: [
                    { name: 'Chris Evans', character: 'Johnny Storm / Human Torch' }
                ]
            }
        }
    ];

    const createMockTmdbService = () => ({
        getAllMoviesCredits: jest.fn().mockResolvedValue(mockCreditsResponse)
    });

    const movies = {
        'Iron Man': 1726,
        'The Avengers': 24428,
        'Fantastic Four': 9738
    };

    const actors = [
        'Robert Downey Jr.',
        'Chris Evans',
        'Gwyneth Paltrow',
        'Scarlett Johansson'
    ];

    describe('getMoviesPerActor', () => {
        it('should return movies for each actor', async () => {
            const mockTmdbService = createMockTmdbService();
            const service = new MovieDataService({
                tmdbService: mockTmdbService,
                movies,
                actors
            });

            const result = await service.getMoviesPerActor();

            expect(result['Robert Downey Jr.']).toEqual(['Iron Man', 'The Avengers']);
            expect(result['Chris Evans']).toEqual(['The Avengers', 'Fantastic Four']);
            expect(result['Gwyneth Paltrow']).toEqual(['Iron Man']);
            expect(result['Scarlett Johansson']).toEqual(['The Avengers']);
        });

        it('should call TMDB service with correct movie data', async () => {
            const mockTmdbService = createMockTmdbService();
            const service = new MovieDataService({
                tmdbService: mockTmdbService,
                movies,
                actors
            });

            await service.getMoviesPerActor();

            expect(mockTmdbService.getAllMoviesCredits).toHaveBeenCalledWith([
                { name: 'Iron Man', id: 1726 },
                { name: 'The Avengers', id: 24428 },
                { name: 'Fantastic Four', id: 9738 }
            ]);
        });
    });

    describe('getActorsWithMultipleCharacters', () => {
        it('should return actors who played multiple characters', async () => {
            const mockTmdbService = createMockTmdbService();
            const service = new MovieDataService({
                tmdbService: mockTmdbService,
                movies,
                actors
            });

            const result = await service.getActorsWithMultipleCharacters();

            // Chris Evans plays both Steve Rogers and Johnny Storm
            expect(result['Chris Evans']).toBeDefined();
            expect(result['Chris Evans']).toContainEqual({
                movieName: 'The Avengers',
                characterName: 'Steve Rogers / Captain America'
            });
            expect(result['Chris Evans']).toContainEqual({
                movieName: 'Fantastic Four',
                characterName: 'Johnny Storm / Human Torch'
            });
        });

        it('should not include actors with only one character', async () => {
            const mockTmdbService = createMockTmdbService();
            const service = new MovieDataService({
                tmdbService: mockTmdbService,
                movies,
                actors
            });

            const result = await service.getActorsWithMultipleCharacters();

            // Robert Downey Jr. only plays Tony Stark
            expect(result['Robert Downey Jr.']).toBeUndefined();
            // Gwyneth Paltrow only plays Pepper Potts
            expect(result['Gwyneth Paltrow']).toBeUndefined();
        });
    });

    describe('getCharactersWithMultipleActors', () => {
        it('should return empty object when no characters have multiple actors', async () => {
            const mockTmdbService = createMockTmdbService();
            const service = new MovieDataService({
                tmdbService: mockTmdbService,
                movies,
                actors
            });

            const result = await service.getCharactersWithMultipleActors();

            // No characters in our mock data are played by multiple actors
            expect(result).toEqual({});
        });

        it('should return characters with multiple actors when they exist', async () => {
            const creditsWithRecast = [
                {
                    movieName: 'Movie 1',
                    credits: {
                        cast: [{ name: 'Actor A', character: 'Hero' }]
                    }
                },
                {
                    movieName: 'Movie 2',
                    credits: {
                        cast: [{ name: 'Actor B', character: 'Hero' }]
                    }
                }
            ];

            const mockTmdbService = {
                getAllMoviesCredits: jest.fn().mockResolvedValue(creditsWithRecast)
            };

            const service = new MovieDataService({
                tmdbService: mockTmdbService,
                movies: { 'Movie 1': 1, 'Movie 2': 2 },
                actors: ['Actor A', 'Actor B']
            });

            const result = await service.getCharactersWithMultipleActors();

            expect(result['Hero']).toBeDefined();
            expect(result['Hero']).toContainEqual({ movieName: 'Movie 1', actorName: 'Actor A' });
            expect(result['Hero']).toContainEqual({ movieName: 'Movie 2', actorName: 'Actor B' });
        });
    });

    describe('caching', () => {
        it('should only call TMDB service once for multiple requests', async () => {
            const mockTmdbService = createMockTmdbService();
            const service = new MovieDataService({
                tmdbService: mockTmdbService,
                movies,
                actors
            });

            // Make multiple calls
            await service.getMoviesPerActor();
            await service.getActorsWithMultipleCharacters();
            await service.getCharactersWithMultipleActors();

            // TMDB service should only be called once
            expect(mockTmdbService.getAllMoviesCredits).toHaveBeenCalledTimes(1);
        });
    });
});
