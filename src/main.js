

// Typing effect for welcome message
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const logElement = document.querySelector('.log p');
  
  if (logElement) {
    // Clear the existing content
    logElement.innerHTML = '';
    
    // Start the typing effect
    typeWriter(logElement, 'Welcome to Kentucky Rook!', 80);
  }
});
