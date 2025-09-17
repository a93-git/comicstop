import { describe, it, expect, beforeAll } from '@jest/globals'
import { randomUUID } from 'crypto'

// Configure test env BEFORE importing the app/db
process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { initializeDatabase, sequelize } = await import('../src/config/database.js')
const { User, Comic, ComicContributor } = await import('../src/models/index.js')

beforeAll(async () => {
  await initializeDatabase()
})

describe('Comics schema and contributors', () => {
  it('creates a comic with spec fields and attaches contributors', async () => {
    const user = await User.create({ username: `u${Date.now()}`, email: `u${Date.now()}@e.com`, password: 'Password1!' })

    const meta = {
      title: 'My Comic',
      subtitle: 'Pilot',
      description: 'Desc',
      genre: 'action',
      genres: ['action', 'adventure'],
      tags: ['tag1', 'tag2'],
      rating: 4.5,
      pageCount: 10,
      fileName: 'book.cbz',
      fileSize: 12345,
      fileType: 'application/x-cbz',
      filePath: '/tmp/book.cbz',
      s3Key: `k/${randomUUID()}`,
      s3Url: 'https://s3/bucket/k',
      thumbnailUrl: 'https://img/thumb.jpg',
      isPublic: true,
      public: true,
      ageRestricted: false,
      price: 1.99,
      offerOnPrice: true,
      status: 'draft',
      publishStatus: 'draft',
      pageOrder: ['p1.jpg', 'p2.jpg'],
      uploaderId: user.id,
    }

    const comic = await Comic.create(meta)

    // Contributor groups
    await ComicContributor.create({ comicId: comic.id, role: 'writer', contributors: ['Alice'] })
    await ComicContributor.create({ comicId: comic.id, role: 'artist', contributors: ['Bob','Carol'] })

    const found = await Comic.findByPk(comic.id, { include: [{ model: ComicContributor, as: 'contributors' }] })
    expect(found).toBeTruthy()
    expect(found.title).toBe('My Comic')
    expect(found.subtitle).toBe('Pilot')
    expect(found.genres).toEqual(['action','adventure'])
    expect(found.tags).toEqual(['tag1','tag2'])
    expect(found.thumbnailUrl).toContain('thumb')
    expect(found.filePath).toContain('/tmp/')
    expect(found.pageOrder).toEqual(['p1.jpg','p2.jpg'])
    expect(Array.isArray(found.contributors)).toBe(true)
    const roles = found.contributors.map(c => c.role).sort()
    expect(roles).toEqual(['artist','writer'])
  })
})
