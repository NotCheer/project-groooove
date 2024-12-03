package db

import (
	"database/sql"
	"log"
	_ "os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	connStr := "user=postgres dbname=mydb password=postgres host=localhost sslmode=disable"
	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
