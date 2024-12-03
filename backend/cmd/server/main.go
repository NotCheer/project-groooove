package main

import (
	"log"
	"net/http"
	"os"

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
	authRouter.HandleFunc("/loops/rate/{id}", apphandlers.GetUserRating).Methods("GET")

	// Session test routes
	router.HandleFunc("/set", apphandlers.SetSessionHandler).Methods("GET")
	router.HandleFunc("/check", apphandlers.CheckSessionHandler).Methods("GET")

	// Auth routes
	router.HandleFunc("/api/login", apphandlers.LoginHandler).Methods("POST")
	router.HandleFunc("/api/oauth/google", apphandlers.GoogleOAuthHandler).Methods("POST")
	router.HandleFunc("/api/signup", apphandlers.CreateUser).Methods("POST")
	router.HandleFunc("/api/logout", apphandlers.LogoutHandler).Methods("GET")

	// Health check route
	router.HandleFunc("/api/health", apphandlers.HealthCheckHandler).Methods("GET")

	// Setup CORS
	cors := handlers.CORS(
        		handlers.AllowedOrigins([]string{"http://34.130.164.179:3000", "http://groooove.me:3000", "https://groooove.me", "http://groooove.me"}),
        		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
        		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
        		handlers.AllowCredentials(),
        	)

        log.Printf("session_key: %s\n gClientID: %s\n, gClientSecret: %s\n", os.Getenv("SESSION_KEY"),
         os.Getenv("GOOGLE_OAUTH_CLIENT_ID"), os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"))

	log.Fatal(http.ListenAndServe(":8080", cors(router)))
}
