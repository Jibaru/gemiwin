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
	for _, msg := range chat.Messages {
		conversation.WriteString(fmt.Sprintf("%s: %s\n", msg.Role, msg.Content))
	}

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
