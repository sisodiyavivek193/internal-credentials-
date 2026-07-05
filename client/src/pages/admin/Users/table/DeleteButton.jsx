import React from 'react';

const DeleteButton = ({ id, isDisabled, onDelete }) => {
    return (
        <button
            onClick={() => onDelete(id)}
            disabled={isDisabled}
            className={`px-4 py-2 text-white rounded-md
                ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 cursor-pointer'}`}
        >
            Delete
        </button>
    );
};

export default DeleteButton;
