
//@ts-nocheck
import { decodeToken, isAdmin, isAnyUser } from "../middleware/auth.middleware";
import { adminDeleteTestimonial, deleteTestimonial, getAllTestimonials, getTestimonialByUser, getTestimonials, postTestimonial, testimonialDetails, updateTestimonialStatus } from "../controllers/testimonial.controller";

import { Router } from "express";

const testimonialRoutes = Router();

testimonialRoutes.get('/list', decodeToken, isAdmin,  getTestimonials)
testimonialRoutes.get('/details',decodeToken, isAdmin, testimonialDetails)
testimonialRoutes.delete('/delete',decodeToken, isAdmin, adminDeleteTestimonial)
testimonialRoutes.post('/update/status', decodeToken, isAdmin,  updateTestimonialStatus)

testimonialRoutes.post('/add', decodeToken, isAdmin, postTestimonial)
testimonialRoutes.delete('/delete/user', decodeToken, isAdmin, deleteTestimonial)
testimonialRoutes.get('/lists/user', decodeToken, isAnyUser, getTestimonialByUser)
testimonialRoutes.get('/lists/', getTestimonials)


export default testimonialRoutes