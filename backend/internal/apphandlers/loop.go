package apphandlers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "github.com/UTSCC09/project-groooove/backend/internal/db"
    "github.com/UTSCC09/project-groooove/backend/internal/models"
    "github.com/UTSCC09/project-groooove/backend/internal/session"

    "github.com/gorilla/mux"
)

func CreateLoop(w http.ResponseWriter, r *http.Request) {
    var newLoop models.LoopInfoJson
    if err := json.NewDecoder(r.Body).Decode(&newLoop); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    sess, err := session.GetSession(r)
    if err != nil {
        http.Error(w, "Session error", http.StatusInternalServerError)
        return
    }

    email, ok := sess.Values["email"].(string)
    if !ok {
        http.Error(w, "Invalid session data", http.StatusUnauthorized)
        return
    }

    // Get user ID by email
    var authorID int
    err = db.DB.QueryRow("SELECT id FROM users WHERE email = $1", email).Scan(&authorID)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    // Set the author ID in the new loop
    newLoop.Author.ID = authorID

    // Insert the new loop into the database
    err = db.DB.QueryRow(
        "INSERT INTO loops(title, author_id, loop, bpm, rating) VALUES($1, $2, $3, $4, $5) RETURNING id",
        newLoop.Title, newLoop.Author.ID, newLoop.Loop, newLoop.BPM, newLoop.Rating,
    ).Scan(&newLoop.ID)

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(newLoop)
}


func GetLoop(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    id, _ := strconv.Atoi(params["id"])

    var loopInfo models.LoopInfoJson
    var author models.BasicUser

    err := db.DB.QueryRow(`
        SELECT id, title, loop::json AS loop, bpm, createdAt, rating, ratingCount, author_id
        FROM loops WHERE id = $1`, id).Scan(
        &loopInfo.ID, &loopInfo.Title, &loopInfo.Loop, &loopInfo.BPM, &loopInfo.CreatedAt,
        &loopInfo.Rating, &loopInfo.RatingCount, &author.ID,
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    // Fetch author details
    err = db.DB.QueryRow("SELECT username FROM users WHERE id = $1", author.ID).Scan(&author.Username)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    loopInfo.Author = author

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(loopInfo)
}


func UpdateLoop(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    id, _ := strconv.Atoi(params["id"])

    var updatedLoop models.LoopInfoJson
    _ = json.NewDecoder(r.Body).Decode(&updatedLoop)

    _, err := db.DB.Exec("UPDATE loops SET author_user_id = $1, serialized_loop = $2, rating = $3 WHERE id = $4", updatedLoop.Author.ID, updatedLoop.Loop, updatedLoop.Rating, id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    err = db.DB.QueryRow("SELECT * FROM loops WHERE id = $1", id).Scan(&updatedLoop.ID, &updatedLoop.Author.ID, &updatedLoop.Loop, &updatedLoop.Rating)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(updatedLoop)
}

func DeleteLoop(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    id, err := strconv.Atoi(params["id"])
    if err != nil {
        http.Error(w, "Invalid loop ID", http.StatusBadRequest)
        return
    }

    sess, err := session.GetSession(r)
    if err != nil {
        http.Error(w, "Session error", http.StatusInternalServerError)
        return
    }

    email, ok := sess.Values["email"].(string)
    if !ok {
        http.Error(w, "Invalid session data", http.StatusUnauthorized)
        return
    }

    var userID int
    err = db.DB.QueryRow("SELECT id FROM users WHERE email = $1", email).Scan(&userID)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    // Check if the loop belongs to the user
    var authorID int
    err = db.DB.QueryRow("SELECT author_id FROM loops WHERE id = $1", id).Scan(&authorID)
    if err != nil {
        http.Error(w, "Loop not found", http.StatusNotFound)
        return
    }

    if authorID != userID {
        http.Error(w, "Unauthorized to delete this loop", http.StatusForbidden)
        return
    }

    _, err = db.DB.Exec("DELETE FROM loops WHERE id = $1", id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}


func GetLoops(w http.ResponseWriter, r *http.Request) {
    pageStr := r.URL.Query().Get("page")
    page, err := strconv.Atoi(pageStr)
    if err != nil || page < 1 {
        page = 1
    }

    const loopsPerPage = 5

    // Get total number of loops
    var totalLoops int
    err = db.DB.QueryRow("SELECT COUNT(*) FROM loops").Scan(&totalLoops)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    totalPages := (totalLoops + loopsPerPage - 1) / loopsPerPage // Calculate total pages

    if page > totalPages {
        page = totalPages
    }

    offset := (page - 1) * loopsPerPage

    rows, err := db.DB.Query(`
        SELECT id, title, loop::json AS loop, bpm, createdAt, rating, ratingCount, author_id
        FROM loops ORDER BY id LIMIT $1 OFFSET $2`, loopsPerPage, offset)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var loops []models.LoopInfoJson
    for rows.Next() {
        var loopInfo models.LoopInfoJson
        var author models.BasicUser

        err := rows.Scan(
            &loopInfo.ID, &loopInfo.Title, &loopInfo.Loop, &loopInfo.BPM, &loopInfo.CreatedAt,
            &loopInfo.Rating, &loopInfo.RatingCount, &author.ID,
        )
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        // Fetch author details
        err = db.DB.QueryRow("SELECT username FROM users WHERE id = $1", author.ID).Scan(&author.Username)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        loopInfo.Author = author
        loops = append(loops, loopInfo)
    }

    if err = rows.Err(); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Prepare the response
    response := models.PagedLoops{
        Page:       page,
        TotalPages: totalPages,
        Loops:      loops,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func RateLoop(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    loopID, err := strconv.Atoi(params["id"])
    if err != nil {
        http.Error(w, "Invalid loop ID", http.StatusBadRequest)
        return
    }

    var rateReq models.RateLoopRequest
    if err := json.NewDecoder(r.Body).Decode(&rateReq); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    if rateReq.Rating < 1 || rateReq.Rating > 5 {
        http.Error(w, "Rating must be between 1 and 5", http.StatusBadRequest)
        return
    }

    sess, err := session.GetSession(r)
    if err != nil {
        http.Error(w, "Session error", http.StatusInternalServerError)
        return
    }

    email, ok := sess.Values["email"].(string)
    if !ok {
        http.Error(w, "Invalid session data", http.StatusUnauthorized)
        return
    }

    var userID int
    err = db.DB.QueryRow("SELECT id FROM users WHERE email = $1", email).Scan(&userID)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    // Insert or update the user's rating for the loop
    _, err = db.DB.Exec(`
        INSERT INTO user_ratings (user_id, loop_id, rating)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, loop_id)
        DO UPDATE SET rating = EXCLUDED.rating`,
        userID, loopID, rateReq.Rating,
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Update the loop's average rating and rating count
    _, err = db.DB.Exec(`
        UPDATE loops
        SET rating = (SELECT AVG(rating) FROM user_ratings WHERE loop_id = $1),
            ratingcount = (SELECT COUNT(*) FROM user_ratings WHERE loop_id = $1)
        WHERE id = $1`,
        loopID,
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

