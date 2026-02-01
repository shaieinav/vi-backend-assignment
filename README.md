# Marvel Movies API

A REST API that provides information about Marvel movies and actors using the TMDB API.

## Features

- **`/moviesPerActor`** - Lists which Marvel movies each actor appeared in
- **`/actorsWithMultipleCharacters`** - Finds actors who played multiple distinct characters
- **`/charactersWithMultipleActors`** - Finds characters played by different actors

## Prerequisites

- Node.js (v20 or higher)
- TMDB API key

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vi-backend-assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your TMDB credentials:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your API key:
   ```
   TMDB_API_KEY=your_api_key_here
   TMDB_BASE_URL=https://api.themoviedb.org/3
   ```

## Running the Server

```bash
npm start
```

The server will start on port 3000 (or the port specified in `PORT` environment variable).

## API Endpoints

### GET /moviesPerActor

Returns a map of actors to the Marvel movies they appeared in.

```bash
curl http://localhost:3000/moviesPerActor
```

**Response format:**
```json
{
  "Robert Downey Jr.": ["Iron Man", "Iron Man 2", "The Avengers", ...],
  "Chris Evans": ["Captain America: The First Avenger", "The Avengers", ...]
}
```

### GET /actorsWithMultipleCharacters

Returns actors who played more than one distinct character across Marvel movies.

```bash
curl http://localhost:3000/actorsWithMultipleCharacters
```

**Response format:**
```json
{
  "Chris Evans": [
    { "movieName": "Fantastic Four (2005)", "characterName": "Johnny Storm / Human Torch" },
    { "movieName": "Captain America: The First Avenger", "characterName": "Captain America / Steve Rogers" }
  ]
}
```

### GET /charactersWithMultipleActors

Returns characters that were played by multiple actors.

```bash
curl http://localhost:3000/charactersWithMultipleActors
```

**Response format:**
```json
{
  "Character Name": [
    { "movieName": "Movie A", "actorName": "Actor One" },
    { "movieName": "Movie B", "actorName": "Actor Two" }
  ]
}
```

## Running Tests

```bash
npm test
```

Tests cover the pure data processing functions and the service layer with mocked TMDB responses.

## Project Structure

```
/
├── index.js                      # Express server + composition root
├── data/
│   └── marvelMovies.js           # Marvel movies & actors data
├── services/
│   ├── tmdbService.js            # TMDB API client
│   └── movieDataService.js       # Business logic service
├── controllers/
│   └── moviesController.js       # HTTP request handlers
├── utils/
│   └── dataProcessor.js          # Pure data transformation functions
└── __tests__/
    ├── dataProcessor.test.js     # Unit tests for data processing
    └── movieDataService.test.js  # Service tests with mocks
```

## Assumptions and Decisions

- **Starter Data Corrections**: The provided starter data contained "Black Panther" (a character name) and "Zoe Saldana" (missing the ñ). These were corrected to "Chadwick Boseman" and "Zoe Saldaña" to match TMDB's actor names.
- **API Key Authentication**: Uses TMDB v3 API with `api_key` query parameter as provided. For production, this should be migrated to TMDB v4 with Bearer token authentication.
- **In-Memory Caching**: Data is cached in memory after the first request. This works for a single instance but would need Redis or similar for multi-instance deployments.
- **Error Handling**: Basic error handling returns 500 status with a generic message. Production should include more granular error responses and retry logic for transient API failures.
- **Data Scope**: Results are filtered to only include the 26 movies and 23 actors specified in the data file.

## Character Name Matching

TMDB returns character names in inconsistent formats. The API uses fuzzy matching (via the `fuzzball` library) to group similar character names:

- **Handled variations**: "Tony Stark" ↔ "Tony Stark / Iron Man", "Steve Rogers / Captain America" ↔ "Captain America / Steve Rogers", "Steve Rogers" ↔ "Steve Rogers (uncredited)"
- **Not handled**: Significantly different names like "Lt. Col. James 'Rhodey' Rhodes" vs "Colonel James Rhodes", or alias names like "Natalie Rushman" vs "Natasha Romanoff"

The matching uses a combination of `token_set_ratio` (handles word reordering) and basic `ratio` (prevents false positives when one name is a subset of another).

## Future Extensions

- Improve character matching for abbreviations and alias names
- Add Redis for distributed caching across multiple instances
- Implement cache invalidation with TTL
- Add rate limiting middleware
- Migrate to TMDB v4 API with Bearer token
- Add request validation and more detailed error responses
- Add ratry mechanism for TMDB HTTP requests
- Add more status codes handling and logs

## Data Source

Movie and actor data is fetched from [The Movie Database (TMDB)](https://www.themoviedb.org/) API.
