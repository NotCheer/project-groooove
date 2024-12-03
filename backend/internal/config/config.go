package config

import (
    "os"
)

func GetConfig() map[string]string {
    return map[string]string{
        "SESSION_KEY":               os.Getenv("SESSION_KEY"),
        "GOOGLE_OAUTH_CLIENT_ID":    os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
        "GOOGLE_OAUTH_CLIENT_SECRET": os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
    }
}
