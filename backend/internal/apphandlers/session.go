// for test porpose only
// TODO: DELETE for production

package apphandlers

import (
    "fmt"
    "net/http"

    "github.com/UTSCC09/project-groooove/backend/internal/session"
)

func SetSessionHandler(w http.ResponseWriter, r *http.Request) {
    sess, _ := session.GetSession(r)
    sess.Values["foo"] = "bar"
    session.SaveSession(w, r, sess)

    fmt.Fprintf(w, "Session has been set")
}

func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
    sess, _ := session.GetSession(r)

    fooValue := sess.Values["foo"]
    if fooValue == nil {
        fmt.Fprintf(w, "Failed to retrieve session value")
        return
    }

    fmt.Fprintf(w, "Session value: %s", fooValue)
}
