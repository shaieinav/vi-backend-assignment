/**
 * Pure functions for transforming movie credit data.
 * No side effects, no external dependencies - easy to test.
 */

import * as fuzz from 'fuzzball';

// Thresholds for fuzzy matching (0-100)
const TOKEN_SET_THRESHOLD = 80;  // For token_set_ratio (handles word reordering)
const RATIO_THRESHOLD = 50;       // Minimum basic ratio to avoid false positives

/**
 * Cleans a character name for comparison.
 * Removes parenthetical notes like "(uncredited)".
 * @param {string} name - Raw character name
 * @returns {string} Cleaned name
 */
function cleanCharacterName(name) {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

/**
 * Checks if two character names represent the same character using fuzzy matching.
 * Uses a combination of token_set_ratio (handles word order) and basic ratio
 * (prevents false positives like "Hero" matching "Different Hero").
 * @param {string} name1 - First character name
 * @param {string} name2 - Second character name
 * @returns {boolean} True if names are similar enough
 */
export function isSameCharacter(name1, name2) {
    const clean1 = cleanCharacterName(name1);
    const clean2 = cleanCharacterName(name2);

    if (!clean1 || !clean2) return false;

    // token_set_ratio handles word reordering and partial matches well
    const tokenSetScore = fuzz.token_set_ratio(clean1, clean2);
    // Basic ratio prevents false positives when one name is a subset of another
    const ratioScore = fuzz.ratio(clean1, clean2);

    return tokenSetScore >= TOKEN_SET_THRESHOLD && ratioScore >= RATIO_THRESHOLD;
}

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
 * Uses fuzzy matching to group similar character names.
 * @param {Array<{movieName: string, credits: {cast: Array}}>} creditsData - Raw credits from TMDB
 * @param {Set<string>} actorFilter - Set of actor names to include
 * @returns {Object.<string, Array<{movieName: string, characterName: string}>>}
 */
export function buildActorsWithMultipleCharacters(creditsData, actorFilter) {
    // Collect all appearances per actor
    const actorAppearances = {};

    for (const { movieName, credits } of creditsData) {
        if (!credits?.cast) continue;

        for (const { name: actorName, character: characterName } of credits.cast) {
            if (!actorFilter.has(actorName)) continue;

            if (!actorAppearances[actorName]) {
                actorAppearances[actorName] = [];
            }
            actorAppearances[actorName].push({ movieName, characterName });
        }
    }

    // Filter to only actors with multiple distinct characters (using fuzzy matching)
    const result = {};

    for (const [actorName, appearances] of Object.entries(actorAppearances)) {
        // Group appearances by similar character names
        const characterGroups = [];

        for (const appearance of appearances) {
            const matchingGroup = characterGroups.find(group =>
                isSameCharacter(group[0].characterName, appearance.characterName)
            );

            if (matchingGroup) {
                matchingGroup.push(appearance);
            } else {
                characterGroups.push([appearance]);
            }
        }

        // If there are multiple distinct character groups, include this actor
        if (characterGroups.length > 1) {
            // Return one representative appearance per character group
            result[actorName] = characterGroups.map(group => group[0]);
        }
    }

    return result;
}

/**
 * Finds characters that were played by more than one actor.
 * Uses fuzzy matching to group similar character names.
 * @param {Array<{movieName: string, credits: {cast: Array}}>} creditsData - Raw credits from TMDB
 * @param {Set<string>} actorFilter - Set of actor names to include
 * @returns {Object.<string, Array<{movieName: string, actorName: string}>>}
 */
export function buildCharactersWithMultipleActors(creditsData, actorFilter) {
    // Group appearances by similar character names using fuzzy matching
    const characterGroups = []; // Array of { name: string, appearances: Array }

    for (const { movieName, credits } of creditsData) {
        if (!credits?.cast) continue;

        for (const { name: actorName, character: characterName } of credits.cast) {
            if (!actorFilter.has(actorName)) continue;

            // Find matching character group
            const matchingGroup = characterGroups.find(group =>
                isSameCharacter(group.name, characterName)
            );

            if (matchingGroup) {
                matchingGroup.appearances.push({ movieName, actorName });
            } else {
                characterGroups.push({
                    name: characterName,
                    appearances: [{ movieName, actorName }]
                });
            }
        }
    }

    // Filter to only characters with multiple distinct actors
    const result = {};

    for (const group of characterGroups) {
        const uniqueActors = new Set(group.appearances.map(a => a.actorName));

        if (uniqueActors.size > 1) {
            result[group.name] = group.appearances;
        }
    }

    return result;
}
