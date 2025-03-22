import React, { useState } from "react";
import ContributeModal from "./components/ContributeModal";
import UploadedContentModal from "./components/UploadedContentModal";

const App = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [uploadedContent, setUploadedContent] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    setLoggedInUser(null);
    alert("You have been logged out!");
  };

  return (
    <div>
      {loggedInUser ? (
        <div className="button-container">
          <button className="button" onClick={handleLogout}>
            Logout
          </button>
          <button className="button" onClick={() => setShowUploadModal(true)}>
            Upload
          </button>
          <button className="button" onClick={() => setShowContentModal(true)}>
            Show Uploaded Content
          </button>
        </div>
      ) : (
        <button
          className="button"
          id="login-button"
          onClick={() => setShowUploadModal(true)}
        >
          Login/Register
        </button>
      )}

      {showUploadModal && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowUploadModal(false)}
          />
          <ContributeModal
            closeModal={() => setShowUploadModal(false)}
            setLoggedInUser={setLoggedInUser}
            loggedInUser={loggedInUser}
            setUploadedContent={setUploadedContent}
            uploadedContent={uploadedContent}
          />
        </>
      )}

      {showContentModal && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowContentModal(false)}
          />
          <UploadedContentModal
            closeModal={() => setShowContentModal(false)}
            uploadedContent={uploadedContent}
          />
        </>
      )}
    </div>
  );
};

export default App;
