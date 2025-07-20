package services

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"gemiwin/api/internal/domain"
	"gemiwin/api/internal/persistence"
)

// BotService generates responses using the Gemini CLI, injecting global and chat configs.
type BotService struct {
	cfgRepo *persistence.AppConfigRepository
}

func NewBotService(cfgRepo *persistence.AppConfigRepository) *BotService {
	return &BotService{cfgRepo: cfgRepo}
}

func (s *BotService) GetBotResponse(chat *domain.Chat) (string, error) {
	// Load global configuration
	appCfg, err := s.cfgRepo.Load()
	if err != nil {
		return "", fmt.Errorf("failed to load app config: %w", err)
	}
	var conversation strings.Builder

	conversation.WriteString("You are the bot, and I am the user.\n")
	conversation.WriteString("Use the previous conversation ONLY as context to answer the final question.\n")
	conversation.WriteString("Do NOT repeat the context, greet, or add extra information.\n")
	conversation.WriteString("You must respond in the SAME LANGUAGE used in the user's last message.\n")
	conversation.WriteString("Conversation: \n")

	for _, msg := range chat.Messages {
		text := msg.Content
		if msg.Type == "doc" && msg.Document != nil {
			text += fmt.Sprintf(" <doc:%s>%s</doc>", msg.Document.Name, msg.Document.Content)
		}
		conversation.WriteString(fmt.Sprintf("%s: %s\n", msg.Role, text))
	}

	conversation.WriteString("Your answer:")

	cmd := exec.Command("gemini")

	// We prepare the standard input of the command with the content of the conversation
	cmd.Stdin = strings.NewReader(conversation.String())

	// Prepare environment variables
	env := os.Environ()
	if appCfg != nil && appCfg.GeminiApiKey != "" {
		env = append(env, "GEMINI_API_KEY="+appCfg.GeminiApiKey)
	}
	model := chat.Config.Model
	if model == "" {
		model = domain.DefaultModel
	}
	env = append(env, "GEMINI_MODEL="+model)
	cmd.Env = env

	var out bytes.Buffer
	cmd.Stdout = &out
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err = cmd.Run(); err != nil {
		return "", fmt.Errorf("error executing gemini command: %w, stderr: %s", err, stderr.String())
	}

	return strings.TrimSpace(out.String()), nil
}
