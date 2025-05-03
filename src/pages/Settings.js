import axios from 'axios';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [theme, setTheme] = useState(user?.settings?.theme || 'light');
  const [notifications, setNotifications] = useState(user?.settings?.notifications !== false);
  
  const saveSettings = async () => {
    try {
      const res = await axios.put('http://localhost:5000/api/users/settings', {
        theme,
        notifications
      });
      
      // Update user in context
      setUser(prev => ({
        ...prev,
        settings: res.data
      }));
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };
  
  return (
    <div className="settings-page">
      <h2>User Settings</h2>
      
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Notifications</h3>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={(e) => setNotifications(e.target.checked)} 
            />
            Enable notifications
          </label>
        </div>
      </div>
      
      <button className="save-settings-btn" onClick={saveSettings}>
        Save Settings
      </button>
    </div>
  );
};

export default Settings;