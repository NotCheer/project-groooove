// for test porpose only
// TODO: DELETE for production

package apphandlers

import (
    "fmt"
    "net/http"
)

func SetSessionHandler(w http.ResponseWriter, r *http.Request) {
    session, _ := Store.Get(r, "session-name")
    session.Values["foo"] = "bar"
    session.Save(r, w)

    fmt.Fprintf(w, "Session has been set")
}

func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
    session, _ := Store.Get(r, "session-name")

    fooValue := session.Values["foo"]
    if fooValue == nil {
        fmt.Fprintf(w, "Failed to retrieve session value")
        return
    }

    fmt.Fprintf(w, "Session value: %s", fooValue)
}
