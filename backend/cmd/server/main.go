package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/csrf"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/UTSCC09/project-groooove/backend/internal/db"
    "github.com/UTSCC09/project-groooove/backend/internal/apphandlers"
    "github.com/UTSCC09/project-groooove/backend/internal/middleware"

)

func main() {
	db.InitDB()
	defer db.CloseDB()

	router := mux.NewRouter()
	router.Use(middleware.LoggingMiddleware)

	authRouter := router.PathPrefix("/api").Subrouter()
	authRouter.Use(middleware.RequireLogin)

	// User routes
	authRouter.HandleFunc("/users", apphandlers.GetUsers).Methods("GET")
	router.HandleFunc("/api/users/{id}", apphandlers.GetUserNameByIDHandler).Methods("GET")

	// Loop routes
	authRouter.HandleFunc("/loops", apphandlers.CreateLoop).Methods("POST")
	router.HandleFunc("/api/loops/{id}", apphandlers.GetLoop).Methods("GET")
	router.HandleFunc("/api/loops", apphandlers.GetLoops).Methods("GET")
	authRouter.HandleFunc("/loops/{id}", apphandlers.UpdateLoop).Methods("PUT")
	authRouter.HandleFunc("/loops/{id}", apphandlers.DeleteLoop).Methods("DELETE")
	authRouter.HandleFunc("/loops/rate/{id}", apphandlers.RateLoop).Methods("POST")
	authRouter.HandleFunc("/loops/rate/{id}", apphandlers.UpdateRating).Methods("PUT")
	authRouter.HandleFunc("/loops/rate/{id}", apphandlers.GetUserRating).Methods("GET")

	// Session test routes
	router.HandleFunc("/set", apphandlers.SetSessionHandler).Methods("GET")
	router.HandleFunc("/check", apphandlers.CheckSessionHandler).Methods("GET")

	// Auth routes
	router.HandleFunc("/api/login", apphandlers.LoginHandler).Methods("POST")
	router.HandleFunc("/api/oauth/google", apphandlers.GoogleOAuthHandler).Methods("POST")
	router.HandleFunc("/api/signup", apphandlers.CreateUser).Methods("POST")
	router.HandleFunc("/api/signout", apphandlers.LogoutHandler).Methods("GET")

	// Health check route
	router.HandleFunc("/api/health", apphandlers.HealthCheckHandler).Methods("GET")

	// Setup CORS
	router.HandleFunc("/api/csrf-token", func(w http.ResponseWriter, r *http.Request) {
            w.Header().Set("X-CSRF-Token", csrf.Token(r))
            w.WriteHeader(http.StatusOK)
        }).Methods("GET")

    cors := handlers.CORS(
         handlers.AllowedOrigins([]string{
              "http://34.130.164.179:3000",
              "http://groooove.me:3000",
              "https://groooove.me",
              "http://groooove.me",
         }),
            handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
            handlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-CSRF-Token"}),
            handlers.AllowCredentials(),
        )

    csrfMiddleware := csrf.Protect(
            []byte(os.Getenv("CSRF_SECRET")),
            csrf.Secure(false), // Set true in production with HTTPS
            csrf.Path("/"), // Limit CSRF token scope
        )

	log.Fatal(http.ListenAndServe(":8080", cors(csrfMiddleware(router))))
}
