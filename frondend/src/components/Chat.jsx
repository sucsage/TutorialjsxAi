import React, { useState, useEffect } from 'react';
import './css/Chat.css'
const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ส่งข้อความไปยัง Node.js Server และรับคำตอบจาก AI
    async function fetchChatResponse(userMessage) {
        try {
            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage }),
            });

            const data = await response.json();
            if (data.response) {
                return data.response;
            } else {
                throw new Error('No response from server');
            }
        } catch (error) {
            throw new Error(`Failed to fetch: ${error.message}`);
        }
    }

    // จัดการเมื่อผู้ใช้กดส่งข้อความ
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        // เพิ่มข้อความของผู้ใช้ใน UI
        const userMessage = { role: 'user', content: userInput };
        setMessages((prev) => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            // รับข้อความตอบกลับจาก AI
            const assistantResponse = await fetchChatResponse(userInput);
            const assistantMessage = { role: 'assistant', content: assistantResponse };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // สร้างองค์ประกอบข้อความ (Message)
    const renderMessages = () => {
        return messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
                <div className="message-content">{message.content}</div>
            </div>
        ));
    };

    return (
        <div className="chat-container">
            {/* Header */}


            {/* Chat Messages */}
            <div className="chat-messages" id="chat-messages">
                {renderMessages()}
                {isLoading && (
                    <div className="loading">Thinking...</div>
                )}
            </div>

            {/* Input Form */}
            <form className="chat-input-container" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={!userInput.trim() || isLoading}
                >
                    Send
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Chat;
