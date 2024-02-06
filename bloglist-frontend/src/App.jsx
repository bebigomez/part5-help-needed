import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notification, setNotification] = useState(null)
  const [user, setUser] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs.sort((a, b) => b.likes - a.likes)))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setNotification({ text: 'Wrong credentials', type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  const handleLogout = () => {
    try {
      window.localStorage.removeItem('loggedUser')
      alert('user logged out')
      setUser(null)
    } catch (exception) {
      alert('Something wrong happened')
    }
  }

  const addBlog = async (blogObject) => {
    blogFormRef.current.toggleVisibility()

    const createdBlog = await blogService.create(blogObject)
    console.log('ESTO SE CONCATENA: ', createdBlog)
    setBlogs(blogs.concat(createdBlog))

    setNotification({
      text: `a new blog that you WONT'T need by ${createdBlog.author}`,
      type: 'success',
    })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const addLike = (id) => {
    const blog = blogs.find((b) => b.id === id)

    const changedBlog = { ...blog, likes: (blog.likes += 1) }

    blogService
      .update(id, changedBlog)
      .then((returnedBlog) => {
        setBlogs(blogs.map((blog) => (blog.id !== id ? blog : returnedBlog)))
      })
      .catch((error) => {
        setNotification('Sorry, something went wrong.')
        setTimeout(() => {
          setNotification(null)
        }, 3000)
      })
  }

  const removeBlog = (blogToDelete) => {
    const confirmation = window.confirm(
      `Delete blog ${blogToDelete.title} by ${blogToDelete.author}`
    )
    if (!confirmation) {
      return
    }

    blogService
      .deleteBlog(blogToDelete.id)
      .then(() => {
        setBlogs(blogs.filter((blog) => blog.id !== blogToDelete.id))
      })
      .catch((error) => {
        setNotification('Sorry, something went wrong.')
      })
  }

  return (
    <div>
      <Notification {...notification} />
      {!user && (
        <LoginForm
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleLogin={handleLogin}
        />
      )}

      {user && (
        <div>
          <h2>blogs</h2>
          <p>
            {user.name} logged in<button onClick={handleLogout}>logout</button>
          </p>

          <div>
            <Togglable buttonLabel="new blog" ref={blogFormRef}>
              <BlogForm addBlog={addBlog} loggedUser={user} />
            </Togglable>
          </div>

          {blogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              loggedUser={user}
              handleLike={() => addLike(blog.id)}
              handleDeletion={() => removeBlog(blog)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default App
