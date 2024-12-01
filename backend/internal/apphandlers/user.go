package apphandlers

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"github.com/UTSCC09/project-groooove/backend/internal/db"
	"github.com/UTSCC09/project-groooove/backend/internal/models"
)

func GetUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query("SELECT id, username, email FROM users")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		err := rows.Scan(&u.ID, &u.Username, &u.Email)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		users = append(users, u)
	}

	json.NewEncoder(w).Encode(users)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var newUser models.User
	_ = json.NewDecoder(r.Body).Decode(&newUser)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = db.DB.Exec("INSERT INTO users(username, email, password) VALUES($1, $2, $3)", newUser.Username, newUser.Email, string(hashedPassword))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	newUser.Password = ""
	json.NewEncoder(w).Encode(newUser)
}
