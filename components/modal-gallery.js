import React from "react";

const ModalGallery = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="float-right text-xl">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalGallery;
