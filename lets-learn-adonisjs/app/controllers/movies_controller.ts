import Movie from '#models/movie'
import cache from '#services/cache_service'
import { MovieService } from '#services/movie_service'
import type { HttpContext } from '@adonisjs/core/http'
import { toHtml } from '@dimerapp/markdown/utils'

export default class MoviesController {
  async index({ view }: HttpContext) {
    const movies: Movie[] = []

    const slugs = await MovieService.getSlugs()

    for (const slug of slugs) {
      if (!(await cache.has(slug))) {
        const md = await MovieService.read(slug)

        const movie = new Movie()
        movie.title = md.frontmatter.title
        movie.summary = md.frontmatter.summary
        movie.slug = slug
        movie.abstract = toHtml(md).contents

        await cache.set(slug, movie)
      }

      movies.push(await cache.get(slug))
    }

    return view.render('pages/home', { movies })
  }

  async show({ view, params }: HttpContext) {
    if (!(await cache.has(params.slug))) {
      const md = await MovieService.read(params.slug)
      const movie = new Movie()
      movie.title = md.frontmatter.title
      movie.summary = md.frontmatter.summary
      movie.slug = params.slug
      movie.abstract = toHtml(md).contents
      await cache.set(params.slug, movie)
    }
    const movie: Movie = await cache.get(params.slug)
    return view.render('pages/movies/show', { movie })
  }
}
