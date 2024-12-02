package apphandlers

import (
    "encoding/json"
    "fmt"
    "net/http"
    "os"
    "context"
    "io/ioutil"
    "database/sql"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
    "github.com/UTSCC09/project-groooove/backend/internal/session"
    "github.com/UTSCC09/project-groooove/backend/internal/db"
)

var googleOauthConfig = &oauth2.Config{
    RedirectURL:  "postmessage",
    ClientID:     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
    ClientSecret: os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
    Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
    Endpoint:     google.Endpoint,
}

const oauthGoogleUrlAPI = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="

func GoogleOAuthHandler(w http.ResponseWriter, r *http.Request) {
    var requestData struct {
        Code string `json:"code"`
    }

    r.Body = http.MaxBytesReader(w, r.Body, 1048576) // 1MB limit

    decoder := json.NewDecoder(r.Body)

    err := decoder.Decode(&requestData)

    if err != nil || requestData.Code == "" {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

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

    var userID int
    result := db.DB.QueryRow("SELECT id FROM users WHERE email = $1", userInfo.Email)
    err = result.Scan(&userID)

    if err == sql.ErrNoRows {
        err = db.DB.QueryRow("INSERT INTO users (email, username) VALUES ($1, $2) RETURNING id", userInfo.Email, userInfo.Name).Scan(&userID)
        if err != nil {
            http.Error(w, "Failed to create new user", http.StatusInternalServerError)
            return
        }
    } else if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    sess, _ := session.GetSession(r)
    sess.Values["email"] = userInfo.Email
    sess.Values["name"] = userInfo.Name
    sess.Values["userId"] = userID
    err = session.SaveSession(w, r, sess)
    if err != nil {
        http.Error(w, "Failed to save session", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Logged in successfully",
        "user_id": userID,
    })
}

func getUserDataFromGoogle(code string) ([]byte, error) {
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