package domain

import "time"

type Role string

const (
	UserRole Role = "user"
	BotRole  Role = "bot"
)

type Message struct {
	Role      Role      `json:"role"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
}
