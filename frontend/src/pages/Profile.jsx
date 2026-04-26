import React, { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Mail, Phone, User } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [profileData, setProfileData] = useState({ name: '', email: '', mobile: '', nic: '' });
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (/[^a-zA-Z\s]/.test(value)) return 'Name must contain only letters and spaces.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Please enter a valid email address.';
        return '';
      case 'mobile':
        if (value && /\D/.test(value)) return 'Mobile number must contain digits only.';
        if (value && value.length !== 10) return 'Mobile number must be exactly 10 digits.';
        return '';
      case 'nic':
        if (value && !/^(\d{9}V|\d{12})$/.test(value))
          return 'NIC must be 9 digits followed by V, or a 12-digit number.';
        return '';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        nic: user.nic || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name' && /[^a-zA-Z\s]/.test(value)) return;
    if (name === 'mobile' && /\D/.test(value)) return;
    if (name === 'mobile' && value.length > 10) return;
    if (name === 'nic') {
      if (/[^0-9V]/.test(value)) return;
      const vIdx = value.indexOf('V');
      if (vIdx !== -1 && vIdx !== value.length - 1) return;
      if (value.includes('V') && value.length > 10) return;
      if (!value.includes('V') && value.length > 12) return;
    }
    setProfileData({ ...profileData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: validateField(name, value) });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    if (err) setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateMessage({ text: '', type: '' });
    const errors = {};
    ['name', 'mobile', 'nic'].forEach((field) => {
      const err = validateField(field, profileData[field]);
      if (err) errors[field] = err;
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setUpdating(true);
    try {
      const response = await api.put('/users/profile', {
        name: profileData.name,
        mobile: profileData.mobile,
        nic: profileData.nic,
      });
      setUpdateMessage({ text: response.data.message || 'Profile updated successfully!', type: 'success' });
      await checkAuth();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setUpdateMessage({ text: msg, type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const completionFields = [
    { key: 'name', label: 'Full name' },
    { key: 'mobile', label: 'Mobile number' },
    { key: 'nic', label: 'NIC number' },
    { key: 'email', label: 'Email address' },
  ];
  const completionCount = completionFields.filter((f) => profileData[f.key]).length;
  const completionPct = Math.round((completionCount / completionFields.length) * 100);

  const inputStyle = (disabled) => ({
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: disabled ? '#94a3b8' : '#0f172a',
    background: disabled ? '#f8fafc' : '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: '0 0 4px', color: '#0f766e', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
          Your Account
        </p>
        <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '850', color: '#0f172a' }}>
          Profile Settings
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          Manage your personal information and contact details.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '24px', alignItems: 'start' }}>
        {/* ── Main form ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: '#ccfbf1', color: '#0f766e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={26} />
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {profileData.name || 'Your Name'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {profileData.email}
              </p>
            </div>
          </div>

          {/* Alert banner */}
          {updateMessage.text && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 14px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: updateMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${updateMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              fontSize: '13px',
              fontWeight: '700',
              color: updateMessage.type === 'success' ? '#15803d' : '#dc2626',
            }}>
              {updateMessage.type === 'success'
                ? <CheckCircle2 size={15} />
                : <span style={{ fontSize: '15px' }}>!</span>}
              {updateMessage.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>
                  <User size={13} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  onBlur={handleBlur}
                  style={inputStyle(false)}
                  required
                />
                {fieldErrors.name && (
                  <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>
                  <Mail size={13} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  style={inputStyle(true)}
                  disabled
                />
                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Email cannot be changed
                </span>
              </div>

              {/* Mobile */}
              <div>
                <label style={labelStyle}>
                  <Phone size={13} />
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={profileData.mobile}
                  onChange={handleProfileChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  placeholder="10-digit number"
                  style={inputStyle(false)}
                />
                {fieldErrors.mobile && (
                  <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.mobile}
                  </span>
                )}
              </div>

              {/* NIC */}
              <div>
                <label style={labelStyle}>
                  <CreditCard size={13} />
                  NIC Number
                </label>
                <input
                  type="text"
                  name="nic"
                  value={profileData.nic}
                  onChange={handleProfileChange}
                  onBlur={handleBlur}
                  placeholder="123456789V or 200012345678"
                  style={{ ...inputStyle(false), textTransform: 'uppercase' }}
                />
                {fieldErrors.nic && (
                  <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.nic}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="submit"
                disabled={updating}
                style={{
                  padding: '11px 24px',
                  background: updating ? '#6ee7b7' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!updating) e.currentTarget.style.background = '#059669'; }}
                onMouseLeave={(e) => { if (!updating) e.currentTarget.style.background = '#10b981'; }}
              >
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Profile completion */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '800', color: '#334155' }}>
              Profile Completion
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
              <span>{completionCount} of {completionFields.length} fields filled</span>
              <span style={{ fontWeight: '800', color: completionPct === 100 ? '#15803d' : '#0f172a' }}>
                {completionPct}%
              </span>
            </div>
            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${completionPct}%`,
                background: completionPct === 100 ? '#10b981' : '#0f766e',
                borderRadius: '99px',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completionFields.map((f) => (
                <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    background: profileData[f.key] ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${profileData[f.key] ? '#bbf7d0' : '#e2e8f0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {profileData[f.key] && <CheckCircle2 size={11} color="#15803d" />}
                  </div>
                  <span style={{ color: profileData[f.key] ? '#0f172a' : '#94a3b8', fontWeight: profileData[f.key] ? '700' : '400' }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Role badge */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#334155' }}>
              Account Role
            </h4>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '800',
              background: user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' ? '#fef3c7' : '#ccfbf1',
              color: user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' ? '#92400e' : '#0f766e',
            }}>
              {user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' ? 'Administrator' : 'Student'}
            </span>
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
              Your role determines which actions and pages are available to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
