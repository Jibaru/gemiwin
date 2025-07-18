package domain

// AppConfig represents global configuration for the application.
// Additional fields can be added over time as new configuration values are required.
type AppConfig struct {
	GeminiApiKey string `json:"gemini_api_key"`
}
