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

    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    result := db.DB.QueryRow("SELECT password FROM users WHERE username = $1", user.Username)
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
    sess.Values["username"] = user.Username

    session.SaveSession(w, r, sess)

    json.NewEncoder(w).Encode(map[string]string{"message": "Logged in successfully"})
}
