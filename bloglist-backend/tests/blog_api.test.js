const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

let token
let blogToDelete

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)

  const user = new User({
    username: 'bebi_tester',
    passwordHash,
  })

  await user.save()

  const response = await api
    .post('/api/login')
    .send({
      username: 'bebi_tester',
      password: 'secret'
    })
    
  token = response.body.token

  const postRequest = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'To be deleted',
      author: 'Bebi tester',
      url: 'deletion.com/',
      likes: 500,
    })


  blogToDelete = postRequest.body
})

test('all blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  // The +1 corresponds to the 'blogToDelete' from the 'beforeEach' I used for the blog deletion test.
  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
})

test('check that blog identifier is named id', async () => {
  const blogObjects = await api.get('/api/blogs')
  blogObjects.body.forEach((blog) => {
    expect(blog.id).toBeDefined()
  })
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'New blog added',
    author: 'Victor Gomez',
    url: 'https://newBlog.com/',
    likes: 1000,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  // The +2 corresponds to the 'blogToDelete' from the 'beforeEach' I used for the blog deletion test.
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 2)

  const titles = blogsAtEnd.map((blog) => blog.title)
  expect(titles).toContain('New blog added')
})

test('if likes property is missing, likes will be 0', async () => {
  const newBlog = {
    title: 'New blog added',
    author: 'Victor Gomez',
    url: 'https://newBlog.com/',
  }

  const blog = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(blog.body.likes).toEqual(0)
})

test('checks if title or url are missing from post request', async () => {
  const newBlog = {
    author: 'Victor Gomez',
    likes: 300,
  }

  const response = await api.post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)

  expect(response.status).toBe(400)
  expect(response.body.error).toBe('Title and url are required')
})

test('blog deletion', async () => {

  const blogsAtStart = await helper.blogsInDb()
  
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

  const titles = blogsAtEnd.map((b) => b.titles)

  expect(titles).not.toContain(blogToDelete.title)
})

test('a blog likes property updates', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const updatedLikes = 1000000

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ likes: updatedLikes })
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()

  const likes = blogsAtEnd.map((r) => r.likes)

  expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  expect(likes).toContain(updatedLikes)
})

afterAll(async () => {
  await mongoose.connection.close()
})
