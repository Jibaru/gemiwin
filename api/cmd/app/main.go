package main

import (
	"flag"
	"fmt"
	"log"

	"gemiwin/api/server"
)

func main() {
	// Define the `-port` flag (default 8080)
	port := flag.String("port", "8080", "Port for the HTTP server")
	flag.Parse()

	addr := fmt.Sprintf(":%s", *port)

	s := server.New()
	if err := s.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
