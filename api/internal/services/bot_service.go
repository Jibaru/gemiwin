package services

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"

	"gemiwin/api/internal/domain"
)

type BotService struct{}

func NewBotService() *BotService {
	return &BotService{}
}

func (s *BotService) GetBotResponse(chat *domain.Chat) (string, error) {
	var conversation strings.Builder

	conversation.WriteString("You are the bot, and I am the user.\n")
	conversation.WriteString("Use the previous conversation ONLY as context to answer the final question.\n")
	conversation.WriteString("Do NOT repeat the context, greet, or add extra information.\n")
	conversation.WriteString("You must respond in the SAME LANGUAGE used in the user's last message.\n")
	conversation.WriteString("Conversation: \n")

	for _, msg := range chat.Messages {
		conversation.WriteString(fmt.Sprintf("%s: %s\n", msg.Role, msg.Content))
	}

	conversation.WriteString("Your answer:")

	// Escape newline characters so the entire prompt is passed as a single argument to the CLI
	escapedPrompt := strings.ReplaceAll(conversation.String(), "\n", "\\n")

	cmd := exec.Command("gemini", "-p", escapedPrompt)

	var out bytes.Buffer
	cmd.Stdout = &out

	err := cmd.Run()
	if err != nil {
		return "", fmt.Errorf("error executing gemini command: %w", err)
	}

	return strings.TrimSpace(out.String()), nil
}
