package apphandlers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "github.com/UTSCC09/project-groooove/backend/internal/db"
    "github.com/UTSCC09/project-groooove/backend/internal/models"

    "github.com/gorilla/mux"
)

func CreateLoop(w http.ResponseWriter, r *http.Request) {
    var newLoop models.Loop
    _ = json.NewDecoder(r.Body).Decode(&newLoop)

    err := db.DB.QueryRow("INSERT INTO loops(author_user_id, serialized_loop, rating) VALUES($1, $2, $3) RETURNING id", newLoop.AuthorUserID, newLoop.SerializedLoop, newLoop.Rating).Scan(&newLoop.ID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(newLoop)
}

func GetLoop(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    id, _ := strconv.Atoi(params["id"])

    var loop models.Loop
    err := db.DB.QueryRow("SELECT * FROM loops WHERE id = $1", id).Scan(&loop.ID, &loop.AuthorUserID, &loop.SerializedLoop, &loop.Rating)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(loop)
}

func UpdateLoop(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    id, _ := strconv.Atoi(params["id"])

    var updatedLoop models.Loop
    _ = json.NewDecoder(r.Body).Decode(&updatedLoop)

    _, err := db.DB.Exec("UPDATE loops SET author_user_id = $1, serialized_loop = $2, rating = $3 WHERE id = $4", updatedLoop.AuthorUserID, updatedLoop.SerializedLoop, updatedLoop.Rating, id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    err = db.DB.QueryRow("SELECT * FROM loops WHERE id = $1", id).Scan(&updatedLoop.ID, &updatedLoop.AuthorUserID, &updatedLoop.SerializedLoop, &updatedLoop.Rating)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(updatedLoop)
}

func DeleteLoop(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    id, _ := strconv.Atoi(params["id"])

    _, err := db.DB.Exec("DELETE FROM loops WHERE id = $1", id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}
