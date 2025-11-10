document.addEventListener("DOMContentLoaded", function () {
  const chatbotButton = document.getElementById("chatbot-button");
  const chatbotContainer = document.getElementById("chatbot-container");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotSend = document.getElementById("chatbot-send");
  const userInput = document.getElementById("chatbot-user-input");
  const messagesContainer = document.getElementById("chatbot-messages");

  chatbotButton.addEventListener("click", function () {
    chatbotContainer.style.display =
      chatbotContainer.style.display === "flex" ? "none" : "flex";
  });

  chatbotClose.addEventListener("click", function () {
    chatbotContainer.style.display = "none";
  });

  chatbotSend.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";

    // Typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot-message");
    typingDiv.textContent = "Diet Assistant is typing...";
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      typingDiv.remove();
      addMessage(data.reply, "bot");
    } catch (error) {
      typingDiv.remove();
      addMessage("Sorry, I’m having trouble connecting right now.", "bot");
    }
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", `${sender}-message`);
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
