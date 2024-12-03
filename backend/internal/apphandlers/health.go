package apphandlers

import (
	"encoding/json"
	"net/http"
	_ "os"

	"github.com/UTSCC09/project-groooove/backend/internal/session"
)

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	sess, err := session.GetSession(r)
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}

	email, ok := sess.Values["email"].(string)
	if !ok || email == "" {
		http.Error(w, "No user logged in", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "email": email})
}
