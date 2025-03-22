import React, { useState } from "react";

const UploadModal = ({ closeUpload, setUploadedContent, uploadedContent }) => {
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files).map((file) => ({
      type: "file",
      content: file.name,
      file,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const handleSave = () => {
    const data = [
      ...uploadedContent,
      ...(text ? [{ type: "text", content: text }] : []),
      ...files,
    ];

    setUploadedContent(data);
    localStorage.setItem("uploadedContent", JSON.stringify(data));
    alert("Data saved locally.");
    closeUpload();
  };

  return (
    <div className="modal">
      <h3>Upload Content</h3>
      <textarea
        placeholder="Write something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="4"
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input type="file" multiple onChange={handleFileChange} />
      {files.length > 0 && (
        <div>
          <h4>Uploaded Files:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.content}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="button" onClick={handleSave}>
        Save
      </button>
      <button className="button" onClick={closeUpload}>
        Close
      </button>
    </div>
  );
};

const LoginModal = ({ closeLogin, setLoggedInUser, users }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user || (email === "admin@example.com" && password === "admin123")) {
      const loggedInUser = user || { username: "Admin", email, role: "admin" };
      setLoggedInUser(loggedInUser);
      alert(`Welcome, ${loggedInUser.username}!`);
      closeLogin();
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="modal">
      <h3>Login</h3>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button className="button" type="submit">
          Login
        </button>
      </form>
      <button className="button" onClick={closeLogin}>
        Back
      </button>
    </div>
  );
};

const RegisterModal = ({ closeRegister, addUser }) => {
  const handleRegister = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    addUser({ username, email, password });
    alert("Registration successful!");
    closeRegister();
  };

  return (
    <div className="modal">
      <h3>Register</h3>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username</label>
          <input type="text" name="username" required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" required />
        </div>
        <button className="button" type="submit">
          Register
        </button>
      </form>
      <button className="button" onClick={closeRegister}>
        Back
      </button>
    </div>
  );
};

const ContributeModal = ({
  closeModal,
  setLoggedInUser,
  loggedInUser,
  setUploadedContent,
  uploadedContent,
}) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [users, setUsers] = useState([
    { username: "Admin", email: "admin@example.com", password: "admin123" },
  ]);

  const addUser = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    setShowLogin(false); // Close login modal but keep the contribute modal open
  };

  return loggedInUser ? (
    // Keep the ContributeModal open after login
    <UploadModal
      closeUpload={closeModal}
      setUploadedContent={setUploadedContent}
      uploadedContent={uploadedContent}
    />
  ) : showLogin ? (
    <LoginModal
      closeLogin={() => setShowLogin(false)}
      setLoggedInUser={handleLoginSuccess}
      users={users}
    />
  ) : showRegister ? (
    <RegisterModal
      closeRegister={() => setShowRegister(false)}
      addUser={addUser}
    />
  ) : (
    <div className="modal">
      <h2>Login/Register</h2>
      <button className="button" onClick={() => setShowLogin(true)}>
        Login
      </button>
      <button className="button" onClick={() => setShowRegister(true)}>
        Register
      </button>
      <button className="button" onClick={closeModal}>
        Close
      </button>
    </div>
  );
};

export default ContributeModal;
