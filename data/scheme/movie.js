import z from 'zod'

export const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z.number().int().min(1888, 'Year must be a valid year').max(new Date().getFullYear(), 'Year cannot be in the future'),
  director: z.string().min(1, 'Director is required'),
  duration: z.number().int().positive('Duration must be a positive number'),
  poster: z.string().url('Poster must be a valid URL').optional(),
  // genre: z.array(z.string()).optional(),
  genre: z.array(
    z.enum(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary', 'Animation'])
      .optional()
  ),
  rate: z.number().min(0, 'Rate must be at least 0').max(10, 'Rate cannot exceed 10').optional()
})

export function validateMovie (movie) {
  return movieSchema.safeParse(movie) // Validate the movie object against the schema
}

export function validatePartialMovie (movie) {
  return movieSchema.partial().safeParse(movie) // Validate partial movie updates
}