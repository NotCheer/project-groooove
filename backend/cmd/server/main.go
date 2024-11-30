package main

import (
	"log"
	"net/http"

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
	authRouter.HandleFunc("/users", apphandlers.CreateUser).Methods("POST")

	// Loop routes
	authRouter.HandleFunc("/loops", apphandlers.CreateLoop).Methods("POST")
	authRouter.HandleFunc("/loops/{id}", apphandlers.GetLoop).Methods("GET")
	authRouter.HandleFunc("/loops/{id}", apphandlers.UpdateLoop).Methods("PUT")
	authRouter.HandleFunc("/loops/{id}", apphandlers.DeleteLoop).Methods("DELETE")

	// Session test routes
	router.HandleFunc("/set", apphandlers.SetSessionHandler).Methods("GET")
	router.HandleFunc("/check", apphandlers.CheckSessionHandler).Methods("GET")

	// Auth routes
	router.HandleFunc("/login", apphandlers.LoginHandler).Methods("POST")
	router.HandleFunc("/oauth/google", apphandlers.GoogleOAuthHandler).Methods("POST")

	// Health check route
	router.HandleFunc("/health", apphandlers.HealthCheckHandler).Methods("GET")

	// Setup CORS
	cors := handlers.CORS(
        		handlers.AllowedOrigins([]string{"http://34.130.164.179:3000", "http://groooove.me:3000", "https://groooove.me", "http://groooove.me"}),
        		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
        		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
        		handlers.AllowCredentials(),
        	)

	log.Fatal(http.ListenAndServe(":8080", cors(router)))
}
