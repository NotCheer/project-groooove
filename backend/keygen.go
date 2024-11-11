package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

func generateRandomKey(length int) string {
	key := make([]byte, length)
	_, err := rand.Read(key)
	if err != nil {
		panic(err)
	}
	return base64.StdEncoding.EncodeToString(key)
}

func main() {
	fmt.Println(generateRandomKey(32)) // Generate a 32-byte key
}
