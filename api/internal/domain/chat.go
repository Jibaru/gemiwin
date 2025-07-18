package domain

import "time"

// Allowed models for chat generation.
const (
	ModelGemini25Pro   = "gemini-2.5-pro"
	ModelGemini25Flash = "gemini-2.5-flash"
	DefaultModel       = ModelGemini25Pro
)

// ChatConfig holds per-chat configuration options.
type ChatConfig struct {
	Model string `json:"model"`
}

type Chat struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"created_at"`
	Config    ChatConfig `json:"config"`
	Messages  []Message  `json:"messages"`
}
