package models

type Loop struct {
    ID             int    `json:"id"`
    AuthorUserID   int    `json:"authorUserId"`
    SerializedLoop string `json:"serializedLoop"`
    Rating         int    `json:"rating"`
}
