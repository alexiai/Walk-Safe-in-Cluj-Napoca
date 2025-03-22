import React from "react";

const UploadedContentModal = ({ closeModal, uploadedContent }) => {
  return (
    <div className="modal">
      <h3>Uploaded Content</h3>
      {uploadedContent.length === 0 ? (
        <p>No content uploaded yet.</p>
      ) : (
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            marginBottom: "10px",
          }}
        >
          {uploadedContent.map((item, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              {item.type === "text" ? (
                <p>{item.content}</p>
              ) : (
                <img
                  src={URL.createObjectURL(item.file)}
                  alt={item.content}
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <button className="button" onClick={closeModal}>
        Close
      </button>
    </div>
  );
};

export default UploadedContentModal;
