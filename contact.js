class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.endpoint = 'https://www.bmreducation.com/screenscape/contact';
        this.messageDiv = document.createElement('div');
        this.messageDiv.id = 'formMessage';
        this.messageDiv.className = 'message-container';
        
        if (this.form) {
            this.form.appendChild(this.messageDiv);
            this.initializeForm();
        } else {
            console.error('Contact form not found in the DOM');
        }
    }

    initializeForm() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupFormValidation();
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
        });
    }

    validateInput(input) {
        const isValid = input.checkValidity();
        const formGroup = input.closest('.form-group');
        
        if (formGroup) {
            formGroup.classList.toggle('has-error', !isValid);
            
            // Remove existing error message if any
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) existingError.remove();
            
            // Add new error message if invalid
            if (!isValid) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = input.validationMessage;
                formGroup.appendChild(errorMessage);
            }
        }
        
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showMessage('Please fill in all required fields correctly', 'error');
            return;
        }

        try {
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            this.toggleLoadingState(true);

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.showMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
                this.form.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showMessage('Unable to send message. Please try again later.', 'error');
        } finally {
            this.toggleLoadingState(false);
        }
    }

    toggleLoadingState(isLoading) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading ? 
            '<span class="spinner"></span>Sending...' : 
            'Send Message';
    }

    showMessage(message, type) {
        if (!this.messageDiv) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message-box ${type}`;
        
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        messageElement.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${message}</span>
        `;

        this.messageDiv.innerHTML = '';
        this.messageDiv.appendChild(messageElement);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (this.messageDiv.contains(messageElement)) {
                    this.messageDiv.removeChild(messageElement);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the form when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
}); 