# Blog workflow (no build tools)

This blog is designed to be easy to maintain on GitHub Pages:

## Add a post

1. Create a Markdown file in `blog/posts/`:
   - Example: `blog/posts/my-new-post.md`
2. Add an entry to `blog/posts.json`:
   - `slug` must match the filename (without `.md`)
3. Commit + push.

Posts render at:

- `blog-post.html?p=<slug>`

Example:

- `blog-post.html?p=perf-stat-baseline`

## Markdown supported

- Headings: `#`, `##`, `###`
- Bullet lists: `- item`
- Code blocks: fenced with triple backticks
- Inline code: `` `like this` ``
- Links: `[text](url)`

