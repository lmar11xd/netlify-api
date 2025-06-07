import express from 'express'
import crypto from 'node:crypto'
import cors from 'cors'
import movies from './data/movies.json' with { type: 'json' }

import { validateMovie, validatePartialMovie, movieSchema } from './data/scheme/movie.js'

const app = express() // Express application
app.disable('x-powered-by') // Disable 'x-powered-by' header
app.use(express.json()) // Middleware to parse JSON bodies

// app.use(cors()) // por defecto permite CORS para todos los orígenes

// CORS configuration
// Allows requests from specific origins and handles preflight requests
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'https://movies-app.com'
    ] // Define accepted origins for CORS

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      callback(null, origin) // Allow the request if the origin is accepted
    } else {
      callback(new Error('CORS not allowed'), false) // Reject the request if the origin is not accepted
    }
  }
}))


const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    message: 'Hello, World!'
  })
})

// Todos los recursos que sean Movies se identifican con /movies
router.get('/movies', (req, res) => {
  const { genre } = req.query // Extract genre from query parameters
  if (genre) {
    const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())) // Filter movies by genre
    return res.json(filteredMovies) // Return filtered movies
  }
  res.json(movies)
})

router.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(m => m.id === id) // Find the movie by ID

  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' }) // Return 404 if not found
  }

  res.json(movie) // Return the found movie
})

router.post('/movies', (req, res) => {
  const result = validateMovie(req.body) // Validate the incoming movie data against the schema

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) }) // Return 400 if validation fails
  }

  const newMovie = {
    id: crypto.randomUUID(), // Generate a unique ID for the new movie
    ...result.data
  }

  movies.push(newMovie) // Add the new movie to the movies array

  res.status(201).json(newMovie) // Return the newly created movie with status 201
})

router.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body) // Validate the incoming partial movie data against the schema

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) }) // Return 400 if validation fails
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(m => m.id === id) // Find the index of the movie by ID

  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' }) // Return 404 if not found
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie
  res.json(updatedMovie)
})

router.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(m => m.id === id) // Find the index of the movie by ID
  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' }) // Return 404 if not found
  }

  movies.splice(movieIndex, 1) // Remove the movie from the array
  res.status(204).json({ message: 'Movie deleted' }) // Return 204 No Content status
})

/* const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
}) */

app.use('/api', router) // Use the router for all API routes

export default app // Export the Express application for use in other files