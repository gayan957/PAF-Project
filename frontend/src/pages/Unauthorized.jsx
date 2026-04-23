import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <ShieldAlert size={80} color="var(--danger)" />
                </div>
                <h1 className="error-code">403</h1>
                <h2 className="error-title">Access Denied</h2>
                <p className="error-message">
                    You don't have the necessary permissions to access this page. 
                    If you believe this is an error, please contact the administrator.
                </p>
                <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={18} />
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
