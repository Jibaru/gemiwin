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

	conversation.WriteString("You are the bot, and I am the user. ")
	conversation.WriteString("Use the previous conversation ONLY as context to answer the final question. ")
	conversation.WriteString("Do NOT repeat the context, greet, or add extra information. ")
	conversation.WriteString("You must respond in the SAME LANGUAGE used in the user's last message. ")
	conversation.WriteString("Conversation: ")

	for _, msg := range chat.Messages {
		conversation.WriteString(fmt.Sprintf("[new line]: %s: %s", msg.Role, msg.Content))
	}

	conversation.WriteString("[new line]: Your answer:")

	prompt := conversation.String()
	cmd := exec.Command("gemini", "-p", prompt)

	var out bytes.Buffer
	cmd.Stdout = &out

	err := cmd.Run()
	if err != nil {
		return "", fmt.Errorf("error executing gemini command: %w", err)
	}

	return strings.TrimSpace(out.String()), nil
}
