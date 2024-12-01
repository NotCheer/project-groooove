package models

type User struct {
    ID       string `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
    Password string `json:"password,omitempty"`
}

type UserCredentials struct {
    Email string
    Password string
}
