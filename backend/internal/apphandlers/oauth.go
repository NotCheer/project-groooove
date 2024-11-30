package apphandlers

import (
    "encoding/json"
    "fmt"
    "net/http"
    "os"
    "context"
    "io/ioutil"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
    "github.com/UTSCC09/project-groooove/backend/internal/session"
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
        Code string `json:"Code"`
    }

    err := json.NewDecoder(r.Body).Decode(&requestData)
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

    sess, _ := session.GetSession(r)
    sess.Values["email"] = userInfo.Email
    sess.Values["name"] = userInfo.Name
    err = session.SaveSession(w, r, sess)
    if err != nil {
        http.Error(w, "Failed to save session", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"message": "Logged in successfully"})
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
