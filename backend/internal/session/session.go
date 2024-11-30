package session

import (
    "net/http"
    "github.com/gorilla/sessions"
    "os"
)

var Store *sessions.CookieStore

func init() {
    Store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
    Store.Options = &sessions.Options{
        Path:     "/",
        MaxAge:   3600 * 8, // 8 hours
        HttpOnly: true,
        Secure:   false, // Set true if using HTTPS
        SameSite: http.SameSiteLaxMode,
    }
}

// GetSession retrieves the session for a given request.
func GetSession(r *http.Request) (*sessions.Session, error) {
    return Store.Get(r, "session-name")
}

// SaveSession saves the session after modifying it.
func SaveSession(w http.ResponseWriter, r *http.Request, session *sessions.Session) error {
    return session.Save(r, w)
}
