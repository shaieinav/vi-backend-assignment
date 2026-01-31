import {
    buildMoviesPerActor,
    buildActorsWithMultipleCharacters,
    buildCharactersWithMultipleActors
} from '../utils/dataProcessor.js';

describe('dataProcessor', () => {
    // Sample test data
    const mockCreditsData = [
        {
            movieName: 'Movie A',
            credits: {
                cast: [
                    { name: 'Actor One', character: 'Hero' },
                    { name: 'Actor Two', character: 'Villain' },
                    { name: 'Actor Three', character: 'Sidekick' }
                ]
            }
        },
        {
            movieName: 'Movie B',
            credits: {
                cast: [
                    { name: 'Actor One', character: 'Different Hero' },
                    { name: 'Actor Two', character: 'Villain' },
                    { name: 'Actor Four', character: 'New Character' }
                ]
            }
        },
        {
            movieName: 'Movie C',
            credits: {
                cast: [
                    { name: 'Actor One', character: 'Hero' },
                    { name: 'Actor Five', character: 'Hero' }
                ]
            }
        }
    ];

    const actorFilter = new Set(['Actor One', 'Actor Two', 'Actor Five']);

    describe('buildMoviesPerActor', () => {
        it('should return movies for each actor in the filter', () => {
            const result = buildMoviesPerActor(mockCreditsData, actorFilter);

            expect(result['Actor One']).toEqual(['Movie A', 'Movie B', 'Movie C']);
            expect(result['Actor Two']).toEqual(['Movie A', 'Movie B']);
            expect(result['Actor Five']).toEqual(['Movie C']);
        });

        it('should not include actors not in the filter', () => {
            const result = buildMoviesPerActor(mockCreditsData, actorFilter);

            expect(result['Actor Three']).toBeUndefined();
            expect(result['Actor Four']).toBeUndefined();
        });

        it('should handle empty credits data', () => {
            const result = buildMoviesPerActor([], actorFilter);
            expect(result).toEqual({});
        });

        it('should handle missing cast in credits', () => {
            const dataWithMissingCast = [
                { movieName: 'Movie X', credits: {} },
                { movieName: 'Movie Y', credits: { cast: [{ name: 'Actor One', character: 'Test' }] } }
            ];
            const result = buildMoviesPerActor(dataWithMissingCast, actorFilter);

            expect(result['Actor One']).toEqual(['Movie Y']);
        });
    });

    describe('buildActorsWithMultipleCharacters', () => {
        it('should return actors who played multiple distinct characters', () => {
            const result = buildActorsWithMultipleCharacters(mockCreditsData, actorFilter);

            // Actor One plays 'Hero' and 'Different Hero' - two distinct characters
            expect(result['Actor One']).toBeDefined();
            expect(result['Actor One'].length).toBe(3); // 3 appearances
        });

        it('should not include actors who played the same character in multiple movies', () => {
            const result = buildActorsWithMultipleCharacters(mockCreditsData, actorFilter);

            // Actor Two plays 'Villain' in both movies - same character
            expect(result['Actor Two']).toBeUndefined();
        });

        it('should handle empty credits data', () => {
            const result = buildActorsWithMultipleCharacters([], actorFilter);
            expect(result).toEqual({});
        });
    });

    describe('buildCharactersWithMultipleActors', () => {
        it('should return characters played by multiple actors', () => {
            const result = buildCharactersWithMultipleActors(mockCreditsData, actorFilter);

            // 'Hero' is played by Actor One (Movie A, Movie C) and Actor Five (Movie C)
            expect(result['Hero']).toBeDefined();
            expect(result['Hero'].length).toBe(3);
            expect(result['Hero']).toContainEqual({ movieName: 'Movie A', actorName: 'Actor One' });
            expect(result['Hero']).toContainEqual({ movieName: 'Movie C', actorName: 'Actor One' });
            expect(result['Hero']).toContainEqual({ movieName: 'Movie C', actorName: 'Actor Five' });
        });

        it('should not include characters played by only one actor', () => {
            const result = buildCharactersWithMultipleActors(mockCreditsData, actorFilter);

            // 'Villain' is only played by Actor Two
            expect(result['Villain']).toBeUndefined();
            // 'Different Hero' is only played by Actor One
            expect(result['Different Hero']).toBeUndefined();
        });

        it('should handle empty credits data', () => {
            const result = buildCharactersWithMultipleActors([], actorFilter);
            expect(result).toEqual({});
        });

        it('should only consider actors in the filter', () => {
            // Actor Three plays 'Sidekick' but is not in filter
            // Actor Four plays 'New Character' but is not in filter
            const result = buildCharactersWithMultipleActors(mockCreditsData, actorFilter);

            expect(result['Sidekick']).toBeUndefined();
            expect(result['New Character']).toBeUndefined();
        });
    });
});
