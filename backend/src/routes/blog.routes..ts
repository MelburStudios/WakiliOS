import { decodeToken, isAdmin, isAdminOrAttorney, isAnyUser, isAttorney } from "../middleware/auth.middleware"
import { deleteCategory, getCategories, getCategory, postCategory } from "../controllers/blog/category.controller"
import { Router } from "express"
import { delTag, getTag, getTags, postTag } from "../controllers/blog/tag.controller"
import { deleteBlog, getBlogDetails, getBlogs,  getPopularBlogs, postBlog, toggleBlogAddToPopular, toggleBlogPublish } from "../controllers/blog/blog.controller"
import { delBlogComment, postBlogComment } from "../controllers/blog/comment.controller"


const blogRoutes = Router()

blogRoutes.get('/category/list', getCategories)
blogRoutes.get('/category',decodeToken, isAdmin, getCategory)
blogRoutes.post('/category', decodeToken , isAdmin, postCategory)
blogRoutes.delete('/category',decodeToken, isAdmin, deleteCategory)

blogRoutes.get('/tag/list', getTags)
blogRoutes.get('/tag',decodeToken, isAdmin, getTag)
blogRoutes.post('/tag',decodeToken, isAdmin, postTag)
blogRoutes.delete('/tag', decodeToken, isAdmin, delTag)

blogRoutes.get('/list', decodeToken, isAnyUser, getBlogs)
blogRoutes.get('/details', decodeToken, isAnyUser, getBlogDetails)
blogRoutes.post('/', decodeToken, isAdmin, postBlog)
blogRoutes.delete('/',decodeToken, isAdmin, deleteBlog)

// public
blogRoutes.get('/public/list', getBlogs)
blogRoutes.get('/public/details', getBlogDetails)

blogRoutes.get('/toggle-publish', decodeToken, isAdmin, toggleBlogPublish)
blogRoutes.get('/toggle-popular', decodeToken, isAdmin, toggleBlogAddToPopular)

blogRoutes.get('/popular', getPopularBlogs)
blogRoutes.get('/details', getBlogDetails)


blogRoutes.post("/comment", isAnyUser, postBlogComment)
blogRoutes.delete("/comment", isAnyUser, delBlogComment)

export default blogRoutes;