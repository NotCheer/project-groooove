package apphandlers

import (
    "encoding/json"
    "net/http"
    "github.com/UTSCC09/project-groooove/backend/internal/db"
    "github.com/UTSCC09/project-groooove/backend/internal/models"
    "github.com/UTSCC09/project-groooove/backend/internal/session"


    "golang.org/x/crypto/bcrypt"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
    var user models.UserCredentials

    r.Body = http.MaxBytesReader(w, r.Body, 1048576)

    decoder := json.NewDecoder(r.Body)
    decoder.DisallowUnknownFields()

    err := decoder.Decode(&user)
    if err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    if user.Email == "" || user.Password == "" {
        http.Error(w, "Email and password are required", http.StatusBadRequest)
        return
    }

    var storedPassword string
    var userID int
    result := db.DB.QueryRow("SELECT id, password FROM users WHERE email = $1", user.Email)
    err = result.Scan(&userID, &storedPassword)
    if err != nil {
        http.Error(w, "Invalid login credentials", http.StatusUnauthorized)
        return
    }

    if err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password)); err != nil {
        http.Error(w, "Invalid login credentials", http.StatusUnauthorized)
        return
    }

    sess, _ := session.GetSession(r)
    sess.Values["email"] = user.Email
    sess.Values["userId"] = userID

    session.SaveSession(w, r, sess)

    // Respond with user ID
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Logged in successfully",
        "user_id": userID,
    })
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
    // Retrieve the current session
    sess, _ := session.GetSession(r)

    // Clear all session values
    sess.Values = make(map[interface{}]interface{})

    // Save the updated session
    session.SaveSession(w, r, sess)

    // Respond to the client
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Logged out successfully",
    })
}
