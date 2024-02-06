import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './BlogForm'
import testHelper from '../../utils/test_helper'

test('renders blog title and author, but not url and likes by default', () => {
  const blog = testHelper.blog

  render(<Blog blog={blog} />)

  const titleAuthorElement = screen.getByText(
    'Testing frontend of the Blog app bebi tester'
  )
  expect(titleAuthorElement).toBeDefined()

  const urlElement = screen.queryByText('testing.com')
  expect(urlElement).toBeNull()

  const likesElement = screen.queryByText('Likes: 100')
  expect(likesElement).toBeNull()
})

test('once show button is clicked, url and likes count are shown', async () => {
  const blog = testHelper.blog

  render(<Blog blog={blog} loggedUser={testHelper.user} />)

  const user = userEvent.setup()
  const button = screen.getByText('show')
  await user.click(button)

  const urlElement = screen.getByText('testing.com')
  expect(urlElement).toBeDefined()

  const likesElement = screen.getByText('Likes: 100')
  expect(likesElement).toBeDefined()
})

test('if the like button is clicked twice, the event handler is called twice', async () => {
  const blog = testHelper.blog

  const mockHandler = jest.fn()

  render(
    <Blog
      blog={blog}
      handleLike={mockHandler}
      loggedUser={testHelper.user}
    />
  )

  const user = userEvent.setup()
  const showButton = screen.getByText('show')
  await user.click(showButton)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(1)
})

test('BlogForm calls the event handler it received as props with the right details when a new blog is created', async () => {
  const addBlog = jest.fn()
  const user = userEvent.setup()

  render(<BlogForm addBlog={addBlog} />)

  const textInputs = screen.queryAllByRole('textbox')
  const sendButton = screen.getByText('save')

  const titleInput = textInputs[0]
  const authorInput = textInputs[1]
  const urlInput = textInputs[2]

  await user.type(titleInput, 'New blog title')
  await user.type(authorInput, 'New blog author')
  await user.type(urlInput, 'New blog url')

  await user.click(sendButton)

  expect(addBlog.mock.calls).toHaveLength(1)

  expect(addBlog.mock.calls[0][0].title).toBe('New blog title')
  expect(addBlog.mock.calls[0][0].author).toBe('New blog author')
  expect(addBlog.mock.calls[0][0].url).toBe('New blog url')
})
