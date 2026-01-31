/**
 * Pure functions for transforming movie credit data.
 * No side effects, no external dependencies - easy to test.
 */

/**
 * Builds a map of actors to the movies they appeared in.
 * @param {Array<{movieName: string, credits: {cast: Array}}>} creditsData - Raw credits from TMDB
 * @param {Set<string>} actorFilter - Set of actor names to include
 * @returns {Object.<string, string[]>} Map of actor name to array of movie names
 */
export function buildMoviesPerActor(creditsData, actorFilter) {
    const result = {};

    for (const { movieName, credits } of creditsData) {
        if (!credits?.cast) continue;

        for (const { name: actorName } of credits.cast) {
            if (!actorFilter.has(actorName)) continue;

            if (!result[actorName]) {
                result[actorName] = [];
            }
            result[actorName].push(movieName);
        }
    }

    return result;
}

/**
 * Finds actors who played more than one distinct character across movies.
 * @param {Array<{movieName: string, credits: {cast: Array}}>} creditsData - Raw credits from TMDB
 * @param {Set<string>} actorFilter - Set of actor names to include
 * @returns {Object.<string, Array<{movieName: string, characterName: string}>>}
 */
export function buildActorsWithMultipleCharacters(creditsData, actorFilter) {
    // First, collect all character appearances per actor
    const actorCharacters = {};

    for (const { movieName, credits } of creditsData) {
        if (!credits?.cast) continue;

        for (const { name: actorName, character: characterName } of credits.cast) {
            if (!actorFilter.has(actorName)) continue;

            if (!actorCharacters[actorName]) {
                actorCharacters[actorName] = [];
            }
            actorCharacters[actorName].push({ movieName, characterName });
        }
    }

    // Filter to only actors with multiple distinct characters
    const result = {};

    for (const [actorName, appearances] of Object.entries(actorCharacters)) {
        const uniqueCharacters = new Set(appearances.map(a => a.characterName));

        if (uniqueCharacters.size > 1) {
            result[actorName] = appearances;
        }
    }

    return result;
}

/**
 * Finds characters that were played by more than one actor.
 * @param {Array<{movieName: string, credits: {cast: Array}}>} creditsData - Raw credits from TMDB
 * @param {Set<string>} actorFilter - Set of actor names to include
 * @returns {Object.<string, Array<{movieName: string, actorName: string}>>}
 */
export function buildCharactersWithMultipleActors(creditsData, actorFilter) {
    // First, collect all actor appearances per character
    const characterActors = {};

    for (const { movieName, credits } of creditsData) {
        if (!credits?.cast) continue;

        for (const { name: actorName, character: characterName } of credits.cast) {
            if (!actorFilter.has(actorName)) continue;

            if (!characterActors[characterName]) {
                characterActors[characterName] = [];
            }
            characterActors[characterName].push({ movieName, actorName });
        }
    }

    // Filter to only characters with multiple distinct actors
    const result = {};

    for (const [characterName, appearances] of Object.entries(characterActors)) {
        const uniqueActors = new Set(appearances.map(a => a.actorName));

        if (uniqueActors.size > 1) {
            result[characterName] = appearances;
        }
    }

    return result;
}
