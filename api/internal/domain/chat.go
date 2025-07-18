package domain

import "time"

type Chat struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Messages  []Message `json:"messages"`
}
