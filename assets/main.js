async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
  }
  
  async function saveData(url, data) {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
  
  // Handle Sign Up
  if (location.pathname.includes("signup.html")) {
    document.getElementById("signupForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullName = document.getElementById("fullName").value;
      const password = document.getElementById("password").value;
      const users = await fetchData("/data/users.json");
      users.push({ id: Date.now(), fullName, password, contacts: [] });
      await saveData("/data/users.json", users);
      alert("User registered!");
      location.href = "login.html";
    });
  }
  
  // Handle Login
  if (location.pathname.includes("login.html")) {
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const loginName = document.getElementById("loginName").value;
      const loginPassword = document.getElementById("loginPassword").value;
      const users = await fetchData("/data/users.json");
      const user = users.find((u) => u.fullName === loginName && u.password === loginPassword);
      if (user) {
        localStorage.setItem("activeUser", JSON.stringify(user));
        location.href = "chat.html";
      } else {
        alert("Invalid credentials!");
      }
    });
  }
  
  // Handle Chat
  if (location.pathname.includes("chat.html")) {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    if (!activeUser) {
      alert("Please login first.");
      location.href = "login.html";
    }
  
    async function loadContacts() {
      const users = await fetchData("/data/users.json");
      const contacts = users.filter((u) => activeUser.contacts.includes(u.id));
      const select = document.getElementById("receiverSelect");
      contacts.forEach((contact) => {
        const option = document.createElement("option");
        option.value = contact.id;
        option.textContent = contact.fullName;
        select.appendChild(option);
      });
    }
  
    async function renderMessages() {
      const messages = await fetchData("/data/messages.json");
      const filteredMessages = messages.filter(
        (msg) =>
          msg.senderId === activeUser.id || msg.receiverId === activeUser.id
      );
      const messagesDiv = document.getElementById("messages");
      messagesDiv.innerHTML = "";
      filteredMessages.forEach((msg) => {
        const sender = msg.senderId === activeUser.id ? "You" : "Friend";
        const p = document.createElement("p");
        p.textContent = `${sender}: ${msg.text}`;
        messagesDiv.appendChild(p);
      });
    }
  
    document.getElementById("sendMessage").addEventListener("click", async () => {
      const receiverId = parseInt(document.getElementById("receiverSelect").value);
      const message = {
        id: Date.now(),
        senderId: activeUser.id,
        receiverId,
        text: document.getElementById("messageInput").value,
      };
      const messages = await fetchData("/data/messages.json");
      messages.push(message);
      await saveData("/data/messages.json", messages);
      document.getElementById("messageInput").value = "";
      renderMessages();
    });
  
    document.getElementById("logoutButton").addEventListener("click", () => {
      localStorage.removeItem("activeUser");
      location.href = "login.html";
    });
  
    loadContacts();
    renderMessages();
  }
  