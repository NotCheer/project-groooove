package middleware

import (
    "bytes"
    "io"
    "log"
    "net/http"
    "time"
)

func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        bodyBytes, err := io.ReadAll(r.Body)
        if err != nil {
            log.Printf("Error reading body: %v", err)
            http.Error(w, "can't read body", http.StatusBadRequest)
            return
        }

        r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

        lrw := NewLoggingResponseWriter(w)
        next.ServeHTTP(lrw, r)

        duration := time.Since(start)

        log.Printf("Method: %s, Path: %s, Body: %s, Status: %d, Duration: %s\n", r.Method, r.URL.Path, string(bodyBytes), lrw.statusCode, duration)
    })
}

type LoggingResponseWriter struct {
    http.ResponseWriter
    statusCode int
}

func NewLoggingResponseWriter(w http.ResponseWriter) *LoggingResponseWriter {
    return &LoggingResponseWriter{w, http.StatusOK}
}

func (lrw *LoggingResponseWriter) WriteHeader(code int) {
    lrw.statusCode = code
    lrw.ResponseWriter.WriteHeader(code)
}
