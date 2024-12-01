package models

import "encoding/json"

type BasicUser struct {
    Username string `json:"username"`
    ID       int    `json:"id"`
}

type LoopInfoJson struct {
    ID          int       `json:"id"`
    Title       string    `json:"title"`
    Author      BasicUser `json:"author"`
    Loop        json.RawMessage `json:"loop"`
    BPM         int       `json:"bpm"`
    CreatedAt   string    `json:"createdAt"`
    Rating      float64   `json:"rating"`
    RatingCount int       `json:"ratingCount"`
}

type RateLoopRequest struct {
    Rating int `json:"rating"`
}
