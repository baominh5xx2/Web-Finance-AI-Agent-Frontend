'use client'
import { useState, useEffect, useRef } from 'react';
import { Modal, Card, Box, TextField, Button, Typography, IconButton, Fab, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

// CSS with !important rules
const fixedButtonStyles = `
  .chatbot-fixed-button {
    position: fixed !important;
    bottom: 20px !important;
    top: auto !important;
    right: 20px !important;
    left: auto !important;
    transform: none !important;
    z-index: 1000 !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
    width: 56px !important;
    height: 56px !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
    }
  }

  .chatbot-fixed-button {
    animation: pulse 2s infinite !important;
  }
`;

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Add the styles to the document
  useEffect(() => {
    // Add the CSS to the document
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = fixedButtonStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleSendMessage = (): void => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Chatbot: Cảm ơn bạn đã gửi tin nhắn!', sender: 'bot' },
        ]);
      }, 1000);
    }
  };

  const toggleModal = (): void => {
    setOpen(!open);
  };

  return (
    <div>
      <Tooltip title="Mở Chatbot" placement="left">
        <Fab
          color="primary"
          className="chatbot-fixed-button"
          ref={buttonRef}
          onClick={toggleModal}
          size="medium"
          aria-label="chat"
        >
          <ChatIcon style={{ fontSize: '28px' }} />
        </Fab>
      </Tooltip>

      <Modal
        open={open}
        onClose={toggleModal}
        aria-labelledby="chatbot-modal"
        aria-describedby="chatbot-description"
      >
        <Box 
          style={{
            position: 'absolute',
            bottom: 'auto',
            top: '50%',
            left: '50%',
            right: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '1000px',
            height: '800px',
            backgroundColor: '#fff',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid #eaeaea',
              paddingBottom: '16px'
            }}
          >
            <Typography variant="h5">Chatbot Hỗ Trợ Tài Chính</Typography>
            <IconButton onClick={toggleModal} size="medium">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box 
            style={{
              height: 'calc(100% - 120px)',
              overflowY: 'auto',
              marginBottom: '16px',
              flex: 1,
              padding: '10px'
            }}
          >
            {messages.length === 0 && (
              <Box 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#666'
                }}
              >
                <Typography variant="h6" style={{ marginBottom: '10px' }}>Chào mừng bạn!</Typography>
                <Typography variant="body1">Hãy gửi tin nhắn để bắt đầu cuộc hội thoại</Typography>
              </Box>
            )}
            {messages.map((msg, index) => (
              <Card
                key={index}
                style={{
                  margin: '10px',
                  padding: '15px',
                  backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#f1f1f1',
                  maxWidth: '80%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  borderRadius: msg.sender === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  display: 'inline-block',
                  marginLeft: msg.sender === 'user' ? 'auto' : '10px',
                  marginRight: msg.sender === 'user' ? '10px' : 'auto'
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Card>
            ))}
          </Box>

          <Box 
            style={{
              display: 'flex',
              gap: '10px',
              padding: '10px',
              borderTop: '1px solid #eaeaea',
              backgroundColor: '#f9f9f9',
              borderRadius: '0 0 8px 8px'
            }}
          >
            <TextField
              variant="outlined"
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              size="medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button 
              variant="contained" 
              onClick={handleSendMessage}
              size="large"
              style={{ minWidth: '100px' }}
            >
              Gửi
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Chatbot;