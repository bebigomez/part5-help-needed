const lodash = require('lodash')

const dummy = () => {
  return 1
}

const likesCounter = (blogs) => {
  return blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const favBlog = blogs.reduce((maxLikesBlog, currentBlog) => {
    return currentBlog.likes > maxLikesBlog.likes ? currentBlog : maxLikesBlog
  }, blogs[0])

  return {
    title: favBlog.title,
    author: favBlog.author,
    likes: favBlog.likes,
  }
}

const mostLikes = (blogs) => {
  // Usar Lodash para agrupar los blogs por autor y sumar los likes
  const likesByAuthor = lodash.groupBy(blogs, 'author')
  
  // Encontrar el autor con más likes
  const authorWithMostLikes = lodash.maxBy(Object.keys(likesByAuthor), author =>
    lodash.sumBy(likesByAuthor[author], 'likes')
  )

  const totalLikes = lodash.sumBy(likesByAuthor[authorWithMostLikes], 'likes')

  // Devolver el resultado con el autor y la cantidad de likes
  return {
    author: authorWithMostLikes,
    likes: totalLikes
  }
}

const mostBlogs = (blogs) => {
  const blogsByAuthor = lodash.groupBy(blogs, 'author')

  // Find the author with the most blogs
  const authorWithMostBlogs = lodash.maxBy(Object.keys(blogsByAuthor), author => blogsByAuthor[author].length)

  // Return the result with author and blog count
  return {
    author: authorWithMostBlogs,
    blogs: blogsByAuthor[authorWithMostBlogs].length
  }
}

module.exports = {
  dummy,
  likesCounter,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
