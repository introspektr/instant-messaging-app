import { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/Toast.css';

const Toast = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast ${type}`}>
            <div className="toast-content">
                <span>{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number
};

export default Toast; 