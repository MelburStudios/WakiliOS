
import { data } from "autoprefixer";
import { del, get, patch, post, postForm, put } from "./api";
export const sendOtp = (data) => post("/user/send-otp", data);
export const postForgot = (data) => post("/auth/forgot-password", data);
export const postResister = (data) => post("/auth/signup", data);
export const postLogin = (data) => post("/auth/login", data);
export const getProfile = (data) => get("/auth/profile", data);
export const updateProfile = (data) => patch("/user/profile", data);
export const adminUpdateProfile = (data) => patch("/admin/profile", data);
export const resetPassword = (data) => post("/auth/reset-password", data);
export const updatepassword = (data) => put("/auth/update-password", data);
export const verifyOtp = (data) => post("/auth/verify-email", data);


// user dashboard
export const getDashboard = (data) => get("/user/dashboard", data);
export const getCaseHistory = (data) => get("/user/cases", data);

// blog list
export const blogCategoryList = (data) => get("/blog/category/list", data)
export const postCategory = (data) => post("/blog/category", data)
export const delCategory = (data) => del("/blog/category", data)
export const postTag = (data) => post("/blog/tag", data)
export const fetchTagsList = (data) => get("/blog/tag/list", data)
export const fetchTag = (data) => get("/blog/tag", data)
export const delTag = (data) => del("/blog/tag", data)
export const fetchBlogsList = (data) => get("/blog/list", data)
export const fetchBlogsListUser = (data) => get("/blog/public/list", data)
export const postBlog = (data) => post("/blog", data)
export const delBlog = (data) => del("/blog", data)
export const fetchBlog = (data) => get("/blog/details", data)
export const fetchPublicBlog = (data) => get("/blog/toggle-publish", data)
export const fetchPopularBlog = (data) => get("/blog/toggle-popular", data)
export const popularBlogList = (data) => get("/blog/popular", data)
export const fetchBlogsTrainer = (data) => get("blog/trainers", data)
export const fetchBlogTrainerdetails = (data) => get("/blog/trainers/details", data)
export const blogDetails = (data) => get("/blog/public/details", data)


// admin newsletter
export const fetchAdminNewsletter = (data) => get("/newsletter/list", data);
export const postAdminNewsletter = (data) => post("/newsletter", data);
export const delAdminNewsletter = (data) => del("/newsletter", data);

// blog comments
export const blogComments = (data) => get("/comment", data)
export const postComments = (data) => post("/blog/comment", data)
export const deleteComments = (data) => del("/blog/comment", data)
export const deleteAdminComments = (data) => del("/comment/delete-admin", data)
export const postCommentReply = (data) => post("/commentReply", data)
export const deleteCommentReply = (data) => del("/commentReply", data)
export const deleteAdminCommentReply = (data) => del("/commentReply/delete-admin", data)
export const fetchSiteSettings = (data) => get("/settings", data)
export const fetchUserTestimonials = (data) => get("/testimonials", data)
export const deleteUserTestimonials = (data) => del("/testimonial/delete/user", data)

//notification
export const fetchAdminNotification = (data) => get("/notification/list/admin", data);
export const fetchVendorNotification = (data) => get("/notification/list/vendor", data);
export const readAdminNotification = (data) => post("/notification/read", data);
export const readAllMarkAdminNotification = (data) => post("/notification/read-all", data);
export const deleteAdminNotification = (data) => del("/notification/delete", data);

// admin contact
export const postContactUs = (data) => post("/contact", data);
export const fetchContact = (data) => get("/contact/list", data);
export const fetchContactDetail = (data) => get("/contact", data);
export const delContact = (data) => del("/contact", data);
export const replyContact = (data) => post("/contact/reply", data);

// admin testimonial
export const fetchAdminTestimonial = (data) => get("/testimonial/list", data);
export const delAdminTestimonial = (data) => del("/testimonial/delete", data);
export const postAdminTestimonial = (data) => post("/testimonial/update/status", data);
export const allTestimonial = (data) => get("/testimonial/lists", data);
export const detailsTestimonial = (data) => get("/testimonial/details", data);

// file upload
export const postSingleImage = (data) => postForm("/file/single-image-upload", data);
export const postMultipleImage = (data) => postForm("/file/multiple-image-upload", data);
export const pdfFileUpload = (data) => postForm("/file/pdf-upload", data);
export const getPdfFileList=(data)=>get('/user/pdf-list',data);
export const getSuccessStripeQuery = (data) => get("/user/appointments/stripe-payment-success", data);
export const getPaypalOrderPaymentSuccess = (data) => get("/user/appointments/paypal-payment-success", data);

// admin Language
export const fetchLanguages = (data) => get('/language/list', data);
export const postLanguage = (data) => post('/language', data);
export const delLanguage = (data) => del('/language', data);
export const fetchTranslations = (data) => get('/language/translations', data);
export const fetchLanguage = (data) => get('/language', data);
export const fetchPublicLanguages = (data) => get('/language/translations', data);

// admin service 
export const getServiceList = (data) => get("/service/list", data);
export const postService = (data) => post("/service/create", data);
export const delService = (data) => del(`/service`, data);
export const getServiceDetailsAdmin = (data) => get('/service/details', data);
//service
export const getServiceAll = (data) => get('/service/public/list', data);
export const getServiceDetails = (data) => get('/service/public/details', data);
// admin case study
export const getCaseStudyList = (data) => get("/cases/list", data);
export const singleCaseStudy = (data) => get("/cases/details", data);
export const postCaseStudy = (data) => post("/cases/create", data);
export const delCaseStudy = (data) => del("/cases", data);


// Admin dashboard
export const getAdminDashboard=(data)=>get('/admin/get-dashboard',data);
export const getAttorney = (data) => get("/admin/attorneys", data);
export const delAttorney = (data) => del("/admin/attorneys", data);
export const attorneyDetails = (data) => get("/admin/attorneys/details", data);
export const postAttorney = (data) => post("/admin/attorneys", data);
export const updateAttorney = (data) => put("/admin/attorneys", data);



//admin and public specialization 
export const fetchSpecialization = (data) => get("/specialization/list", data);
export const postSpecialization = (data) => post("/specialization", data);
export const delSpecialization = (data) => del("/specialization", data);

// Admin settings
export const fetchAdminSettings = (data) => get('/settings', data);
export const postAdminSettings = (data) => postForm('/settings', data);


//email settings 
export const fetchEmailSettings = (data) => get("/mail-credentials", data)
export const postEmailSettings = (data) => post("/mail-credentials", data)


//Attorney dashboard
export const getAttorneyDashboard = (data) => get('/attorney/dashboard', data);
export const getAttorneyProfile = (data) => get('/attorney/profile', data);
export const updateAttorneyProfile = (data) => patch('/attorney/profile', data);

//Attorney availablilty
export const postAvailbility=(data)=>post('/attorney/availability',data);
export const getAvailbility=(data)=>get('/attorney/availability',data);
// user testimonial
export const fetchUserTestimonial = (data) => get("/testimonial/lists/user", data);
export const postUserTestimonial = (data) => post("/testimonial/add", data);

// User Attorney 
export const fetchUserAttorney = (data) => get("/user/attorneys", data);
export const bookAttorney = (data) => post("/user/appointments", data);

// User Appointment
export const attorneylist = (data) => get("user/appoinment-attorney-list", data);
export const postfileUpload = (data) => post("/user/post-pdf", data);
// Admin FAQ

export const fetchFaq = (data) => get("/faqs/list", data);
export const postFaq = (data) => post("/faqs", data);
export const singleFaq = (data) => get("/faqs", data);
export const delFaq = (data) => del("/faqs", data);

//public Attorneys
export const fetchAttorneys = (data) => get("/public/attorneys", data);
export const fetchAttorneyDetails = (data) => get("/public/attorneys/details", data);

// Admin currency
export const fetchCurrency = (data) => get("/currency/list", data);
// export const fetchSingleCurrency = (data) => get("/currency", data);

export const postCurrency = (data) => post("/currency", data);
export const delCurrency = (data) => del("/currency", data);

// message
export const userListMessaged = (data) => get("/message/list/users", data);
export const messageList = (data) => get("/message/list", data);
export const postMessages = (data) => post("/message", data);
export const deleteMessage = (data) => del("/message/delete", data);
export const adminMessaged = (data) => get("/message/admin-info", data);
export const fetchUser = (data) => get("/user/profile", data);


//Admin Page
export const postPage = (data) => post("/pages", data);
export const fetchSinglePage = (data) => get("/pages", data);

// admin payment methods 
export const fetchPaymentMethods = (data) => get("/payment/method/list", data);
export const fetchUserPaymentMethods = (data) => get("/payment/method/user/list", data);
export const fetchPaymentMethod = (data) => get("/payment/method", data);
export const postPaymentMethod = (data) => post("/payment/method", data);
export const delPaymentMethod = (data) => del("/payment/method", data);
export const paymentList = (data) => get("/admin/get-payment-list", data);

// public case study 
export const getCaseStudyAll = (data) => get("/cases/public/list", data);
export const getCaseStudyDetails = (data) => get("/cases/public/details", data);
//User Appointment
export const getAppointmentHistory=(data)=>get("/user/appointments-list",data);
export const getAppointmentDetails=(data)=>get("/user/appointments-details",data);
export const appointmentAttorneyList=(data)=>get('/user/appoinment-attorney-list',data);
//attorney Appointment
export const getBookingAppointment=(data)=>get('/attorney/appointments',data);
export const getBookingdetails=(data)=>get('/attorney/appointments-details',data);
export const updateBookingStatus=(data)=>post('/attorney/appointments-status',data);
//attorney clients
export const getAllClients=(data)=>get('/attorney/get-client-list',data);
export const getClientDetails=(data)=>get('/attorney/get-client-list-details',data);
//attorney cases
export const getAttorneyCases=(data)=>get('/attorney/my-cases',data);
export const getAttorneyCaseDetails=(data)=>get('/attorney/my-cases-details',data);
// admin cases details 
export const getAdminCaseDetails=(data)=>get('/admin/get-my-cases-admindetails',data);
//attorney hearing
export const userHearing=(data)=>get('/user/appointments-hearing',data);
export const attorneyHearing=(data)=>get('/attorney/appointments-hearing',data);
export const userbookingSlots=(data)=>get('/user/appointments/booking/slot',data)