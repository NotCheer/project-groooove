package middleware

import (
    "net/http"
    "github.com/UTSCC09/project-groooove/backend/internal/session"
)

func RequireLogin(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        sess, err := session.GetSession(r)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        if _, ok := sess.Values["email"]; !ok {
            http.Error(w, "You need to login first", http.StatusUnauthorized)
            return
        }

        next.ServeHTTP(w, r)
    })
}
