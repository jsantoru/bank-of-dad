'use client';

export function LogoutButton() {
  const handleLogout = () => {
    // Send request with invalid credentials to trigger auth prompt
    fetch('/api/logout', {
      headers: {
        'Authorization': 'Basic ' + btoa('logout:logout')
      }
    }).then(() => {
      // Redirect to home to trigger new auth prompt
      window.location.href = '/';
    });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: 'inherit',
        border: '1px solid currentColor',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Logout
    </button>
  );
}
