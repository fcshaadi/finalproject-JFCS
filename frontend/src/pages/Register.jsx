import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    userFullName: '',
    userEmail: '',
    userPassword: '',
    beneficiaryFullName: '',
    beneficiaryEmail: '',
    beneficiaryPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.userFullName.trim()) {
      newErrors.userFullName = 'Full name is required';
    }

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = 'Invalid email format';
    }

    if (!formData.userPassword) {
      newErrors.userPassword = 'Password is required';
    } else if (formData.userPassword.length < 8) {
      newErrors.userPassword = 'Password must be at least 8 characters';
    }

    if (!formData.beneficiaryFullName.trim()) {
      newErrors.beneficiaryFullName = 'Beneficiary full name is required';
    }

    if (!formData.beneficiaryEmail.trim()) {
      newErrors.beneficiaryEmail = 'Beneficiary email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.beneficiaryEmail)) {
      newErrors.beneficiaryEmail = 'Invalid email format';
    }

    if (!formData.beneficiaryPassword) {
      newErrors.beneficiaryPassword = 'Beneficiary password is required';
    } else if (formData.beneficiaryPassword.length < 8) {
      newErrors.beneficiaryPassword = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        // Simulate payment (as per requirements)
        // In a real app, this would be a separate API call
        // For MVP, we just proceed after registration
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Digital Legacy Vault</h1>
        <h2>Create Your Account</h2>
        <p className="register-description">
          Register to create your secure vault and set up a beneficiary
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Your Information</h3>
            <div className="form-group">
              <label htmlFor="userFullName">Full Name *</label>
              <input
                type="text"
                id="userFullName"
                name="userFullName"
                value={formData.userFullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
              {errors.userFullName && (
                <div className="error-message">{errors.userFullName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="userEmail">Email *</label>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
              {errors.userEmail && (
                <div className="error-message">{errors.userEmail}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="userPassword">Password *</label>
              <input
                type="password"
                id="userPassword"
                name="userPassword"
                value={formData.userPassword}
                onChange={handleChange}
                required
                placeholder="Enter your password (min. 8 characters)"
                minLength={8}
              />
              {errors.userPassword && (
                <div className="error-message">{errors.userPassword}</div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Beneficiary Information</h3>
            <div className="form-group">
              <label htmlFor="beneficiaryFullName">Beneficiary Full Name *</label>
              <input
                type="text"
                id="beneficiaryFullName"
                name="beneficiaryFullName"
                value={formData.beneficiaryFullName}
                onChange={handleChange}
                required
                placeholder="Enter beneficiary's full name"
              />
              {errors.beneficiaryFullName && (
                <div className="error-message">{errors.beneficiaryFullName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="beneficiaryEmail">Beneficiary Email *</label>
              <input
                type="email"
                id="beneficiaryEmail"
                name="beneficiaryEmail"
                value={formData.beneficiaryEmail}
                onChange={handleChange}
                required
                placeholder="Enter beneficiary's email"
              />
              {errors.beneficiaryEmail && (
                <div className="error-message">{errors.beneficiaryEmail}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="beneficiaryPassword">Beneficiary Password *</label>
              <input
                type="password"
                id="beneficiaryPassword"
                name="beneficiaryPassword"
                value={formData.beneficiaryPassword}
                onChange={handleChange}
                required
                placeholder="Enter beneficiary's password (min. 8 characters)"
                minLength={8}
              />
              {errors.beneficiaryPassword && (
                <div className="error-message">{errors.beneficiaryPassword}</div>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register & Activate Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

