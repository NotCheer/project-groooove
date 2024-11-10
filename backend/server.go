package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"
	"io"
   	"bytes"
   	"strconv"
   	"os"
   	"fmt"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	_ "github.com/go-playground/validator/v10"
	"github.com/gorilla/sessions"
)

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
}

type Loop struct {
	ID            int    `json:"id"`
	AuthorUserID  int    `json:"authorUserId"`
	SerializedLoop string `json:"serializedLoop"`
	Rating        int    `json:"rating"`
}

type UserCredentials struct {
	Username string
	Password string
}

var db *sql.DB
var Store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))

// test

var (
	key   = []byte("super-secret-key")
	store = sessions.NewCookieStore(key)
)

func setSessionHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session-name")
	session.Values["foo"] = "bar"
	session.Save(r, w)

	fmt.Fprintf(w, "Session has been set")
}

func checkSessionHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session-name")

	fooValue := session.Values["foo"]
	if fooValue == nil {
		fmt.Fprintf(w, "Failed to retrieve session value")
		return
	}

	fmt.Fprintf(w, "Session value: %s", fooValue)
}

// ---------- middlewares ------------- //

func RequireLogin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, err := Store.Get(r, "session-name")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Check if user is authenticated
		if _, ok := session.Values["username"]; !ok {
			http.Error(w, "You need to login first", http.StatusUnauthorized)
			return
		}

		// If the user is authenticated, call the next handler
		next.ServeHTTP(w, r)
	})
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Read the request body
		bodyBytes, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading body: %v", err)
			http.Error(w, "can't read body", http.StatusBadRequest)
			return
		}

		// You need to restore the body content after reading it
		r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		lrw := NewLoggingResponseWriter(w)
		next.ServeHTTP(lrw, r)

		duration := time.Since(start)

		// Log the request body in addition to the other information
		log.Printf("Method: %s, Path: %s, Body: %s, Status: %d, Duration: %s\n", r.Method, r.URL.Path, string(bodyBytes), lrw.statusCode, duration)
	})
}


type LoggingResponseWriter struct {
    http.ResponseWriter
    statusCode int
}

func NewLoggingResponseWriter(w http.ResponseWriter) *LoggingResponseWriter {
    // Write the status code if WriteHeader is not called
    return &LoggingResponseWriter{w, http.StatusOK}
}

func (lrw *LoggingResponseWriter) WriteHeader(code int) {
    lrw.statusCode = code
    lrw.ResponseWriter.WriteHeader(code)
}

func main() {
	connStr := "user=postgres dbname=mydb password=postgres host=localhost sslmode=disable"
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	router := mux.NewRouter()
    router.Use(loggingMiddleware)

    // Auth routes
    router.HandleFunc("/api/login", LoginHandler).Methods("POST")

    authRouter := router.PathPrefix("/api").Subrouter()
    authRouter.Use(RequireLogin)

    // User routes
    authRouter.HandleFunc("/users", getUsers).Methods("GET")
    authRouter.HandleFunc("/users", createUser).Methods("POST")

    // Loop routes
    authRouter.HandleFunc("/loops", createLoop).Methods("POST")
    authRouter.HandleFunc("/loops/{id}", getLoop).Methods("GET")
    authRouter.HandleFunc("/loops/{id}", updateLoop).Methods("PUT")
    authRouter.HandleFunc("/loops/{id}", deleteLoop).Methods("DELETE")

    // Cookie test routes
    router.HandleFunc("/set", setSessionHandler).Methods("GET")
    router.HandleFunc("/check", checkSessionHandler).Methods("GET")

    log.Fatal(http.ListenAndServe(":8080", router))

}

// ------------ auths ---------------

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var user UserCredentials

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Retrieve the user from the database
	result := db.QueryRow("SELECT password FROM users WHERE username = $1", user.Username)
	storedPassword := ""
	err = result.Scan(&storedPassword)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Compare the stored hashed password, with the hashed version of the password that was received
	if err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password)); err != nil {
		http.Error(w, "Invalid login credentials", http.StatusUnauthorized)
		return
	}

	session, _ := Store.Get(r, "session-name")
	session.Values["username"] = user.Username
	session.Save(r, w)

	json.NewEncoder(w).Encode(map[string]string{"message": "Logged in successfully"})
}

// ------------ users -----------------

func getUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, username, email FROM users")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		err := rows.Scan(&u.ID, &u.Username, &u.Email)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		users = append(users, u)
	}

	json.NewEncoder(w).Encode(users)
}

func createUser(w http.ResponseWriter, r *http.Request) {
	var newUser User
	_ = json.NewDecoder(r.Body).Decode(&newUser)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = db.Exec("INSERT INTO users(username, email, password) VALUES($1, $2, $3)", newUser.Username, newUser.Email, string(hashedPassword))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	newUser.Password = "" // Remove the password before sending response
	json.NewEncoder(w).Encode(newUser)
}

// ----------- Loop API -------------

func createLoop(w http.ResponseWriter, r *http.Request) {
	var newLoop Loop
	_ = json.NewDecoder(r.Body).Decode(&newLoop)

	err := db.QueryRow("INSERT INTO loops(author_user_id, serialized_loop, rating) VALUES($1, $2, $3) RETURNING id", newLoop.AuthorUserID, newLoop.SerializedLoop, newLoop.Rating).Scan(&newLoop.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(newLoop)
}

func getLoop(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var loop Loop
	err := db.QueryRow("SELECT * FROM loops WHERE id = $1", id).Scan(&loop.ID, &loop.AuthorUserID, &loop.SerializedLoop, &loop.Rating)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(loop)
}

func updateLoop(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var updatedLoop Loop
	_ = json.NewDecoder(r.Body).Decode(&updatedLoop)

	_, err := db.Exec("UPDATE loops SET author_user_id = $1, serialized_loop = $2, rating = $3 WHERE id = $4", updatedLoop.AuthorUserID, updatedLoop.SerializedLoop, updatedLoop.Rating, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the updated loop
	err = db.QueryRow("SELECT * FROM loops WHERE id = $1", id).Scan(&updatedLoop.ID, &updatedLoop.AuthorUserID, &updatedLoop.SerializedLoop, &updatedLoop.Rating)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(updatedLoop)
}

func deleteLoop(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	_, err := db.Exec("DELETE FROM loops WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

