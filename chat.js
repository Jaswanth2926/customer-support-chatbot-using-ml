$(document).ready(function() {
    var fileid = '2ce20ca20a9ff3d88c9f0467d96c4b13d00ae946';
    const $chatWidget = $('#chatWidget');
    const $chatToggle = $('#chatToggle');
    const $chatMessages = $('#chatMessages');
    const $userInput = $('#userInput');
    const $sendBtn = $('#sendBtn');
    const $minimizeBtn = $('.minimize-btn');

    // Initialize chat state
    let isChatOpen = false;

    // Toggle chat widget function
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            $chatWidget.addClass('active').show();
            $chatToggle.hide();
            $userInput.focus();
            scrollToBottom();
        } else {
            $chatWidget.removeClass('active').hide();
            $chatToggle.show();
        }
    }

    // Event Listeners
    $chatToggle.on('click', function(e) {
        e.preventDefault();
        toggleChat();
    });

    $minimizeBtn.on('click', function(e) {
        e.preventDefault();
        toggleChat();
    });

    // Add conversation history tracking
    let conversationHistory = {};
    let messageCount = {
        ai: 1,
        human: 1
    };

    function addMessage(sender, text, shouldStore = false) {
        const time = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (shouldStore) {
            const key = sender === 'bot' ? `ai_${messageCount.ai++}` : `human_${messageCount.human++}`;
            conversationHistory[key] = text;
            console.log('Updated conversation history:', conversationHistory);
        }

        const $messageDiv = $(`
            <div class="message ${sender}-message">
                <div class="message-content">
                    <p>${text}</p>
                    <span class="time">${time}</span>
                </div>
            </div>
        `);
        
        $chatMessages.append($messageDiv);
        smoothScrollToBottom();
    }

    // Update sendMessage function
    async function sendMessage() {
        const message = $userInput.val().trim();
        if (!message) return;

        addMessage('user', message, true);
        $userInput.val('').focus();
        $sendBtn.prop('disabled', true);

        showTypingIndicator();

        try {
            const formData = new FormData();
            formData.append('input-field', message);
            formData.append('fileid', fileid);
            formData.append('conversation_history', JSON.stringify(conversationHistory));

            const response = await fetch('https://www.bmreducation.com/screenscape/ai', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            hideTypingIndicator();

            if (data.status === 'success' && data.response) {
                addMessage('bot', data.response, true);
            } else {
                console.error('AI response failed:', data);
                showNotification('Could not process your request. Please try again.');
                addMessage('bot', 'I apologize, but I encountered an error. Please try asking again.', false);
            }
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            showNotification('Network error. Please check your connection.');
            addMessage('bot', 'Sorry, I encountered a network error. Please try again later.', false);
        }
    }

    // Event listeners for sending messages
    $sendBtn.on('click', sendMessage);
    
    $userInput.on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            sendMessage();
        }
    }).on('input', function() {
        $sendBtn.prop('disabled', !$(this).val().trim());
    });

    // Update predefined buttons handler
    $('.chat-suggestions button').on('click', async function() {
        const predefinedInput = $(this).data('query');
        const buttonText = $(this).text();
        
        addMessage('user', buttonText, true);
        showTypingIndicator();

        try {
            const formData = new FormData();
            formData.append('input-field', predefinedInput);
            formData.append('fileid', '2ce20ca20a9ff3d88c9f0467d96c4b13d00ae946');
            formData.append('conversation_history', JSON.stringify(conversationHistory));

            const response = await fetch('https://www.bmreducation.com/screenscape/ai', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            hideTypingIndicator();

            if (data.status === 'success' && data.response) {
                addMessage('bot', data.response, true);
            } else {
                showNotification('Could not process your request. Please try again.');
                addMessage('bot', 'I apologize, but I encountered an error. Please try asking again.', false);
            }
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            showNotification('Network error. Please check your connection.');
            addMessage('bot', 'Sorry, I encountered a network error. Please try again later.', false);
        }
    });

    // Helper functions
    function showTypingIndicator() {
        const $typing = $(`
            <div class="message bot-message typing-indicator">
                <div class="message-content">
                    <div class="dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `);
        $chatMessages.append($typing);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        $('.typing-indicator').remove();
    }

    function scrollToBottom() {
        const chatBody = document.querySelector('.chat-body');
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Add this function to handle smooth scrolling
    function smoothScrollToBottom() {
        const chatBody = document.querySelector('.chat-body');
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: 'smooth'
        });
    }

    $('.new-chat-btn').on('click', function() {
        resetConversation();
    });

    // Also scroll to bottom when chat is opened
    $chatToggle.on('click', function() {
        $chatWidget.addClass('active').show();
        $chatToggle.hide();
        $userInput.focus();
        setTimeout(scrollToBottom, 100); // Small delay to ensure proper scrolling
    });

    // Add these variables at the top of your $(document).ready function
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    // Add these notification functions at the top
    function showNotification(message, type = 'error') {
        const $notification = $(`
            <div class="chat-notification ${type}">
                <div class="notification-content">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                    <span>${message}</span>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);

        // Add to DOM
        $('.chat-widget').append($notification);

        // Animate in
        setTimeout(() => $notification.addClass('show'), 100);

        // Auto remove after 5 seconds
        const timeout = setTimeout(() => {
            removeNotification($notification);
        }, 5000);

        // Close button handler
        $notification.find('.notification-close').on('click', () => {
            clearTimeout(timeout);
            removeNotification($notification);
        });
    }

    function removeNotification($notification) {
        $notification.removeClass('show');
        setTimeout(() => $notification.remove(), 300);
    }

    // Update the audio recording functions
    async function sendAudioToServer(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
            const response = await fetch('https://www.bmreducation.com/screenscape/audio-text', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.status === 'success' && data.response) {
                $('#userInput').val(data.response);
                $('#sendBtn').prop('disabled', false);
                showNotification('Audio transcribed successfully!', 'success');
            } else {
                console.error('Audio transcription failed:', data);
                showNotification('Could not process audio. Please try again.');
            }
        } catch (error) {
            console.error('Error sending audio:', error);
            showNotification('Network error. Please check your connection.');
        }
    }

    function setupAudioRecording() {
        const $voiceBtn = $('.voice-btn');
        
        $voiceBtn.on('click', async function() {
            try {
                if (!isRecording) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];

                    mediaRecorder.ondataavailable = (event) => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        await sendAudioToServer(audioBlob);
                        stream.getTracks().forEach(track => track.stop());
                    };

                    $voiceBtn.addClass('recording');
                    $voiceBtn.find('i').removeClass('fa-microphone').addClass('fa-stop');
                    isRecording = true;
                    showNotification('Recording started...', 'success');
                    
                    mediaRecorder.start();
                } else {
                    mediaRecorder.stop();
                    $voiceBtn.removeClass('recording');
                    $voiceBtn.find('i').removeClass('fa-stop').addClass('fa-microphone');
                    isRecording = false;
                    showNotification('Recording completed', 'success');
                }
            } catch (err) {
                console.error('Error accessing microphone:', err);
                showNotification('Microphone access denied. Please check your permissions.');
            }
        });
    }

    // Add this to your existing $(document).ready function
    $(document).ready(function() {
        setupAudioRecording();
        const style = `
            <style>
                .voice-btn.recording {
                    color: #ff4444;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            </style>
        `;
        $('head').append(style);
        handleFileUpload();
    });

    // Add a function to handle network timeouts
    function fetchWithTimeout(url, options, timeout = 30000) {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timed out')), timeout)
            )
        ]);
    }

    // Add different types of notifications for different scenarios
    function showErrorNotification(message) {
        showNotification(message, 'error');
    }

    function showSuccessNotification(message) {
        showNotification(message, 'success');
    }

    function showWarningNotification(message) {
        showNotification(message, 'warning');
    }

    // Add CSS for warning notifications
    const warningStyles = `
        .chat-notification.warning {
            border-left: 4px solid #ffa000;
        }
        .chat-notification.warning i {
            color: #ffa000;
        }
    `;
    $('head').append(`<style>${warningStyles}</style>`);

    // Add function to reset conversation
    function resetConversation() {
        conversationHistory = {};
        messageCount = {
            ai: 1,
            human: 1
        };
        $chatMessages.empty();
        // Store initial greeting in conversation history
        fileid = '2ce20ca20a9ff3d88c9f0467d96c4b13d00ae946';
        addMessage('bot', 'Hello! How can I assist you today?', true);
    }

    // Add debug function to view conversation history
    function viewConversationHistory() {
        console.log('Current Conversation History:', conversationHistory);
    }

    // Add file upload handling functions
    function handleFileUpload() {
        const $uploadBtn = $('.upload-btn');
        let isUploading = false;

        // Add file input dynamically
        const $fileInput = $('<input type="file" accept=".pdf,.txt" style="display: none;">');
        $('body').append($fileInput);

        $uploadBtn.on('click', function() {
            if (isUploading) {
                showNotification('A file is currently being processed...', 'warning');
                return;
            }
            $fileInput.click();
        });

        $fileInput.on('change', async function(e) {
            const file = e.target.files[0];
            
            // Validate file
            if (!validateFile(file)) {
                $fileInput.val(''); // Clear input
                return;
            }

            isUploading = true;
            $uploadBtn.addClass('uploading').prop('disabled', true);
            
            try {
                const formData = new FormData();
                formData.append('filedata', file);
                resetConversation();
                addMessage('user', `📎 Uploading: ${file.name}`, false);
                showTypingIndicator();

                const response = await fetchWithTimeout('https://www.bmreducation.com/screenscape/file-upload', {
                    method: 'POST',
                    body: formData
                }, 30000);

                if (!response.ok) throw new Error('Upload failed');
                
                const data = await response.json();
                hideTypingIndicator();

                if (data.status === 'success' && data.response) {
                    // Store both messages in history
                    addMessage('user', `📎 Uploaded: ${file.name}`, true);
                    addMessage('bot', `chat with the document`, true);
                    fileid = data.response;

                    showNotification('File processed successfully!', 'success');
                } else {
                    throw new Error('Processing failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                hideTypingIndicator();
                addMessage('bot', 'Sorry, I could not process your file. Please try again.', false);
                showNotification('File upload failed. Please try again.', 'error');
            } finally {
                isUploading = false;
                $uploadBtn.removeClass('uploading').prop('disabled', false);
                $fileInput.val(''); // Clear input
            }
        });
    }
    

    // File validation function
    function validateFile(file) {
        // Check file type
        const allowedTypes = ['application/pdf', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('Please upload only PDF or text files.', 'error');
            return false;
        }

        // Check file size (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification('File size must be less than 10MB.', 'error');
            return false;
        }

        return true;
    }

    // Add CSS for upload button states
    const uploadStyles = `
        <style>
            .upload-btn.uploading {
                color: #2196F3;
                animation: pulse 1.5s infinite;
            }
            .upload-btn.uploading i {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    $('head').append(uploadStyles);
}); 