package domain

import "time"

type Role string

const (
	UserRole Role = "user"
	BotRole  Role = "bot"
)

type Message struct {
	Role      Role      `json:"role"`
	Type      string    `json:"type"`
	Content   string    `json:"content"`
	Document  *Document `json:"document,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}
