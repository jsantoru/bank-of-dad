import { headers } from 'next/headers';

export async function AuthStatus() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader) {
    return null;
  }

  // Parse Basic Auth credentials
  const auth = authHeader.split(' ')[1];
  const [username] = Buffer.from(auth, 'base64').toString().split(':');

  // Determine if admin or read-only
  const adminUsername = process.env.AUTH_USERNAME || 'admin';
  const readonlyUsername = process.env.AUTH_READONLY_USERNAME;

  const isAdmin = username === adminUsername;
  const isReadOnly = readonlyUsername && username === readonlyUsername;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#6b7280'
    }}>
      <span>
        {username} {isAdmin ? '(admin)' : isReadOnly ? '(read-only)' : ''}
      </span>
    </div>
  );
}
