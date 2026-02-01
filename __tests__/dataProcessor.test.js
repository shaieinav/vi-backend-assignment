import {
    isSameCharacter,
    buildMoviesPerActor,
    buildActorsWithMultipleCharacters,
    buildCharactersWithMultipleActors
} from '../utils/dataProcessor.js';

describe('dataProcessor', () => {

    describe('isSameCharacter (fuzzy matching)', () => {
        it('should match identical names', () => {
            expect(isSameCharacter('Tony Stark', 'Tony Stark')).toBe(true);
        });

        it('should match names with different order', () => {
            expect(isSameCharacter('Steve Rogers / Captain America', 'Captain America / Steve Rogers')).toBe(true);
        });

        it('should match name with alias', () => {
            expect(isSameCharacter('Tony Stark', 'Tony Stark / Iron Man')).toBe(true);
        });

        it('should match after removing parenthetical notes', () => {
            expect(isSameCharacter('Steve Rogers', 'Steve Rogers (uncredited)')).toBe(true);
        });

        it('should NOT match completely different characters', () => {
            expect(isSameCharacter('Tony Stark', 'Steve Rogers')).toBe(false);
            expect(isSameCharacter('Peter Parker', 'Peter Quill')).toBe(false);
        });
    });

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
            expect(result['Actor One'].length).toBe(2); // One per distinct character
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

        it('should group similar character names using fuzzy matching', () => {
            const dataWithVariations = [
                {
                    movieName: 'Movie X',
                    credits: {
                        cast: [{ name: 'Actor One', character: 'Tony Stark' }]
                    }
                },
                {
                    movieName: 'Movie Y',
                    credits: {
                        cast: [{ name: 'Actor One', character: 'Tony Stark / Iron Man' }]
                    }
                }
            ];
            const result = buildActorsWithMultipleCharacters(dataWithVariations, actorFilter);

            // Same character with variations should be grouped - actor shouldn't appear
            expect(result['Actor One']).toBeUndefined();
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

            expect(result['Villain']).toBeUndefined();
        });

        it('should handle empty credits data', () => {
            const result = buildCharactersWithMultipleActors([], actorFilter);
            expect(result).toEqual({});
        });

        it('should only consider actors in the filter', () => {
            const result = buildCharactersWithMultipleActors(mockCreditsData, actorFilter);

            expect(result['Sidekick']).toBeUndefined();
            expect(result['New Character']).toBeUndefined();
        });

        it('should group similar character names using fuzzy matching', () => {
            const dataWithVariations = [
                {
                    movieName: 'Movie X',
                    credits: {
                        cast: [{ name: 'Actor One', character: 'James Rhodes / War Machine' }]
                    }
                },
                {
                    movieName: 'Movie Y',
                    credits: {
                        cast: [{ name: 'Actor Two', character: 'War Machine / James Rhodes' }]
                    }
                }
            ];
            const result = buildCharactersWithMultipleActors(dataWithVariations, actorFilter);

            // Same character with variations should be grouped together
            const keys = Object.keys(result);
            expect(keys.length).toBe(1);
            expect(result[keys[0]].length).toBe(2);
        });
    });
});
