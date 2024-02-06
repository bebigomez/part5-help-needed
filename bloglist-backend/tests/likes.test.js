const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')

describe('total likes', () => {
  test('dummy returns one', () => {
    const blogs = []
  
    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
  })
  
  test('of empty list is zero', () => {
    const result = listHelper.likesCounter([])
    expect(result).toBe(0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.likesCounter(helper.listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.likesCounter(helper.listWithManyBlogs)
    expect(result).toBe(36)
  })
})

describe('favorite authors/blogs', () => {
  test('blog with the most likes gets returned as favorite', () => {
    const result = listHelper.favoriteBlog(helper.listWithManyBlogs)
    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    })
  })

  test('author with the most likes in a post', () => {
    const result = listHelper.mostLikes(helper.listWithManyBlogs)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17,
    })
  })

  test('author with the most blogs written', () => {
    const result = listHelper.mostBlogs(helper.listWithManyBlogs)
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3,
    })
  })
})
