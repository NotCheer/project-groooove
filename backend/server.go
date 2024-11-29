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
   	"context"
   	"io/ioutil"
   	"golang.org/x/oauth2"
    "golang.org/x/oauth2/google"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	_ "github.com/go-playground/validator/v10"
	"github.com/gorilla/sessions"
	_ "github.com/golang-jwt/jwt"
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

var googleOauthConfig = &oauth2.Config{
	RedirectURL:  "postmessage",
	ClientID:     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
	ClientSecret: os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	Endpoint:     google.Endpoint,
}

const oauthGoogleUrlAPI = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="

// ------------ health check ----------------

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
    session, err := Store.Get(r, "session-name")
    if err != nil {
        http.Error(w, "Failed to get session", http.StatusInternalServerError)
        return
    }

    email, ok := session.Values["email"].(string)
    if !ok || email == "" {
        http.Error(w, "No user logged in", http.StatusUnauthorized)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "ok", "email": email})
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

// OAuth

func GoogleOAuthHandler(w http.ResponseWriter, r *http.Request) {
    var requestData struct {
        Code string `json:"Code"`
    }

    // Decode the request body to get the authorization code
    err := json.NewDecoder(r.Body).Decode(&requestData)
    if err != nil || requestData.Code == "" {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    // Use the code to get user data from Google
    userData, err := getUserDataFromGoogle(requestData.Code)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    var userInfo struct {
        Email string `json:"email"`
        Name  string `json:"name"`
    }
    if err := json.Unmarshal(userData, &userInfo); err != nil {
        http.Error(w, "Failed to parse user data", http.StatusInternalServerError)
        return
    }

    // Set session with user information
    session, _ := Store.Get(r, "session-name")
    session.Values["email"] = userInfo.Email
    session.Values["name"] = userInfo.Name
    err = session.Save(r, w)
    if err != nil {
        http.Error(w, "Failed to save session", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"message": "Logged in successfully"})
}

func getUserDataFromGoogle(code string) ([]byte, error) {
	// Use code to get token and get user info from Google.

	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("code exchange wrong: %s", err.Error())
	}
	response, err := http.Get(oauthGoogleUrlAPI + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %s", err.Error())
	}
	defer response.Body.Close()
	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("failed read response: %s", err.Error())
	}
	return contents, nil
}

// test

func setSessionHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := Store.Get(r, "session-name")
	session.Values["foo"] = "bar"
	session.Save(r, w)

	fmt.Fprintf(w, "Session has been set")
}

func checkSessionHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := Store.Get(r, "session-name")

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
    return &LoggingResponseWriter{w, http.StatusOK}
}

func (lrw *LoggingResponseWriter) WriteHeader(code int) {
    lrw.statusCode = code
    lrw.ResponseWriter.WriteHeader(code)
}

func init() {
    Store.Options = &sessions.Options{
        Domain:   "groooove.me",
        Path:     "/",
        MaxAge:   3600 * 8, // 8 hours
        HttpOnly: true,
        Secure:   true,
        SameSite: http.SameSiteNoneMode,
    }
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

    authRouter := router.PathPrefix("/api").Subrouter()
    authRouter.Use(RequireLogin)

    // User routes
    authRouter.HandleFunc("/users", getUsers).Methods("GET")

    // Loop routes
    authRouter.HandleFunc("/loops", createLoop).Methods("POST")
    authRouter.HandleFunc("/loops/{id}", getLoop).Methods("GET")
    authRouter.HandleFunc("/loops/{id}", updateLoop).Methods("PUT")
    authRouter.HandleFunc("/loops/{id}", deleteLoop).Methods("DELETE")

    // Cookie test routes
    router.HandleFunc("/set", setSessionHandler).Methods("GET")
    router.HandleFunc("/check", checkSessionHandler).Methods("GET")

    // Auth routes
    router.HandleFunc("/login", LoginHandler).Methods("POST")
    router.HandleFunc("/users", createUser).Methods("POST")

    //OAuth
    router.HandleFunc("/oauth/google", GoogleOAuthHandler).Methods("POST")

    // Health check route
    router.HandleFunc("/health", HealthCheckHandler).Methods("GET")

    // Setup CORS
    	cors := handlers.CORS(
    		handlers.AllowedOrigins([]string{"http://34.130.164.179:3000", "http://groooove.me:3000", "https://groooove.me"}),
    		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
    		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
    		handlers.AllowCredentials(),
    	)

    log.Printf("session_key: %s\n gClientID: %s\n, gClientSecret: %s\n", os.Getenv("SESSION_KEY"),
     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"), os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"))

    log.Fatal(http.ListenAndServe(":8080", cors(router)))

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

