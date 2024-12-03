package apphandlers

import (
    "encoding/json"
    "net/http"
    "fmt"
    "strconv"
    _ "log"
    "database/sql"
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
    id, err := strconv.Atoi(params["id"])
    if err != nil {
        http.Error(w, "Invalid loop ID", http.StatusBadRequest)
        return
    }

    var updatedLoop models.LoopInfoJson
    if err := json.NewDecoder(r.Body).Decode(&updatedLoop); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // Update the loop in the database
    _, err = db.DB.Exec(
        "UPDATE loops SET title = $1, loop = $2, bpm = $3, rating = $4 WHERE id = $5",
        updatedLoop.Title, updatedLoop.Loop, updatedLoop.BPM, updatedLoop.Rating, id,
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Retrieve the updated loop details
    var author models.BasicUser
    err = db.DB.QueryRow(`
        SELECT id, title, loop::json AS loop, bpm, createdAt, rating, ratingCount, author_id
        FROM loops WHERE id = $1`, id).Scan(
        &updatedLoop.ID, &updatedLoop.Title, &updatedLoop.Loop, &updatedLoop.BPM, &updatedLoop.CreatedAt,
        &updatedLoop.Rating, &updatedLoop.RatingCount, &author.ID,
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

    updatedLoop.Author = author

    w.Header().Set("Content-Type", "application/json")
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

    sortBy := r.URL.Query().Get("sortBy")
    validSortColumns := map[string]string{
        "createdAt": "createdAt",
        "rating":    "rating",
        "id":        "id",
    }
    if _, ok := validSortColumns[sortBy]; !ok {
        sortBy = "id" // Default sorting
    }

    order := r.URL.Query().Get("order")
    if order != "asc" && order != "desc" {
        order = "asc" // Default order
    }

    userIdStr := r.URL.Query().Get("userId")
    var userId int
    if userIdStr != "" {
        userId, err = strconv.Atoi(userIdStr)
        if err != nil {
            http.Error(w, "Invalid userId parameter", http.StatusBadRequest)
            return
        }
    }

    const loopsPerPage = 5

    // Prepare query for counting total loops
    countQuery := "SELECT COUNT(*) FROM loops"
    if userIdStr != "" {
        countQuery += " WHERE author_id = $1"
    }

    // Get total number of loops
    var totalLoops int
    if userIdStr != "" {
        err = db.DB.QueryRow(countQuery, userId).Scan(&totalLoops)
    } else {
        err = db.DB.QueryRow(countQuery).Scan(&totalLoops)
    }

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    totalPages := (totalLoops + loopsPerPage - 1) / loopsPerPage // Calculate total pages

    if page > totalPages {
        page = totalPages
    }

    if page < 1 {
        page = 1
    }

    offset := (page - 1) * loopsPerPage

    // Prepare query for fetching loops
    query := fmt.Sprintf(`
        SELECT id, title, loop::json AS loop, bpm, createdAt, rating, ratingCount, author_id
        FROM loops`)

    if userIdStr != "" {
        query += " WHERE author_id = $3"
    }

    query += fmt.Sprintf(" ORDER BY %s %s LIMIT $1 OFFSET $2", validSortColumns[sortBy], order)

    var rows *sql.Rows
    if userIdStr != "" {
        rows, err = db.DB.Query(query, loopsPerPage, offset, userId)
    } else {
        rows, err = db.DB.Query(query, loopsPerPage, offset)
    }

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

    if rateReq.Rating < 1 || rateReq.Rating > 10 {
        http.Error(w, "Rating must be between 1 and 10", http.StatusBadRequest)
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

func UpdateRating(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPut {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

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

    if rateReq.Rating < 1 || rateReq.Rating > 10 {
        http.Error(w, "Rating must be between 1 and 10", http.StatusBadRequest)
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

    // Update the user's rating for the loop
    result, err := db.DB.Exec(`
        UPDATE user_ratings
        SET rating = $1
        WHERE user_id = $2 AND loop_id = $3`,
        rateReq.Rating, userID, loopID,
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if rowsAffected == 0 {
        http.Error(w, "Rating not found", http.StatusNotFound)
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


func GetUserRating(w http.ResponseWriter, r *http.Request) {
    // Extract loop ID from the URL
    params := mux.Vars(r)
    loopID, err := strconv.Atoi(params["id"])
    if err != nil {
        http.Error(w, "Invalid loop ID", http.StatusBadRequest)
        return
    }

    // Get the session and retrieve the user's ID
    sess, err := session.GetSession(r)
    if err != nil {
        http.Error(w, "Session error", http.StatusInternalServerError)
        return
    }

    userID, ok := sess.Values["userId"].(int)
    if !ok {
        http.Error(w, "Invalid session data", http.StatusUnauthorized)
        return
    }

    // Query the user's rating for the loop
    var rating *int
    err = db.DB.QueryRow("SELECT rating FROM user_ratings WHERE user_id = $1 AND loop_id = $2", userID, loopID).Scan(&rating)
    if err != nil {
        if err == sql.ErrNoRows {
            // Return rating as null if no rating is found
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(map[string]interface{}{"rating": nil})
            return
        }
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Return the user's rating
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{"rating": rating})
}


