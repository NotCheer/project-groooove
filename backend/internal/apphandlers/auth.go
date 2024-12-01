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

    result := db.DB.QueryRow("SELECT password FROM users WHERE email = $1", user.Email)
    storedPassword := ""
    err = result.Scan(&storedPassword)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password)); err != nil {
        http.Error(w, "Invalid login credentials", http.StatusUnauthorized)
        return
    }

    sess, _ := session.GetSession(r)
    sess.Values["email"] = user.Email

    session.SaveSession(w, r, sess)

    json.NewEncoder(w).Encode(map[string]string{"message": "Logged in successfully"})
}
