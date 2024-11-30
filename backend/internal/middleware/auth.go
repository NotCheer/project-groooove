package middleware

import (
    "net/http"
    "github.com/UTSCC09/project-groooove/backend/internal/apphandlers"
)

func RequireLogin(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        session, err := apphandlers.Store.Get(r, "session-name")
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        if _, ok := session.Values["username"]; !ok {
            http.Error(w, "You need to login first", http.StatusUnauthorized)
            return
        }

        next.ServeHTTP(w, r)
    })
}
