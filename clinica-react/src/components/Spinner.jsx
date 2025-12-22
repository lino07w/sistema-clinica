import React from 'react';

const Spinner = ({ size = '40px', color = '#0A4D68' }) => {
    return (
        <div style={styles.container}>
            <div style={{ ...styles.spinner, width: size, height: size, borderTopColor: color }}></div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem',
    },
    spinner: {
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    }
};

// Add raw CSS for the animation if not present
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleSheet);
}

export default Spinner;
