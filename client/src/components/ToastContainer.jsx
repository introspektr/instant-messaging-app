import { useState, useCallback } from 'react';
import Toast from './Toast';
import '../styles/Toast.css';

// Create a unique ID for each toast
let toastId = 0;

const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    // Function to add a new toast
    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = toastId++;
        setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
        return id;
    }, []);

    // Function to remove a toast
    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return {
        toastElements: (
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        ),
        addToast,
        removeToast
    };
};

export default ToastContainer; 