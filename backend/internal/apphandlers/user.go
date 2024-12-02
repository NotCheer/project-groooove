package apphandlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"golang.org/x/crypto/bcrypt"
	"github.com/gorilla/mux"
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

func GetUserNameByIDHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    userIDStr, ok := vars["id"]
    if !ok {
        http.Error(w, "User ID is required", http.StatusBadRequest)
        return
    }

    userID, err := strconv.Atoi(userIDStr)
    if err != nil || userID <= 0 {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    var userName string
    err = db.DB.QueryRow("SELECT username FROM users WHERE id = $1", userID).Scan(&userName)
    if err == sql.ErrNoRows {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    } else if err != nil {
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"username": userName})
}