package apphandlers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "time"

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

    // Set user ID as a secure cookie
    http.SetCookie(w, &http.Cookie{
        Name:     "userId",
        Value:    strconv.Itoa(userID),
        Path:     "/",
        HttpOnly: false,
        Secure:   true,
        Expires:  time.Now().Add(24 * time.Hour),
    })

    // Respond with user ID
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Logged in successfully",
        "user_id": userID,
    })
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
    // Retrieve the current session
    sess, err := session.GetSession(r)
    if err != nil {
        http.Error(w, "Failed to get session", http.StatusInternalServerError)
        return
    }

    // Clear all session values
    sess.Values = make(map[interface{}]interface{})

    // Set the MaxAge to -1 to delete the session cookie
    sess.Options.MaxAge = -1

    // Save the updated session
    err = session.SaveSession(w, r, sess)
    if err != nil {
        http.Error(w, "Failed to save session", http.StatusInternalServerError)
        return
    }

    // Delete the user ID cookie
    http.SetCookie(w, &http.Cookie{
        Name:     "userId",
        Value:    "",
        Path:     "/",
        MaxAge:   -1,
        HttpOnly: false,
        Secure:   true,
    })

    // Respond to the client
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Logged out successfully",
    })
}

