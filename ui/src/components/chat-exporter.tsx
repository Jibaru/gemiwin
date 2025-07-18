import React, { useState } from 'react';
import { Button } from './ui/button';
import { Chat } from '@/services/api';

interface ChatExporterProps {
  chat: Chat | null;
}

export const ChatExporter: React.FC<ChatExporterProps> = ({ chat }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportToMarkdown = () => {
    if (!chat) return;

    const content = chat.messages.map(msg => `**${msg.role}**: ${msg.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToPDF = async () => {
    if (!chat) return;

    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    
    const element = document.getElementById('chat-container');
    if (element) {
      const canvas = await html2canvas(element);
      const data = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${chat.name}.pdf`);
    }
    setIsOpen(false);
  };

  if (!chat) return null;

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
        Export
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-10">
          <button
            onClick={exportToMarkdown}
            className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
          >
            Download as Markdown
          </button>
          <button
            onClick={exportToPDF}
            className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
          >
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
};
