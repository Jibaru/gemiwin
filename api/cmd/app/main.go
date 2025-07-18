package main

import (
	"gemiwin/api/server"
)

func main() {
	s := server.New()
	s.Run(":8080")
}
