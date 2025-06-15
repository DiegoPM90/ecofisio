const http = require('http');

// Test Google OAuth session persistence
async function testGoogleOAuthFlow() {
  console.log('=== Testing Google OAuth Session Persistence ===');
  
  // Step 1: Test Google OAuth initiation
  const googleAuthOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/google',
    method: 'GET',
    headers: {
      'User-Agent': 'OAuth-Test-Client/1.0'
    }
  };

  const req1 = http.request(googleAuthOptions, (res) => {
    console.log('Google OAuth Initiation Status:', res.statusCode);
    console.log('Location Header:', res.headers.location);
    console.log('Set-Cookie Headers:', res.headers['set-cookie']);
    
    if (res.statusCode === 302 && res.headers.location) {
      console.log('✅ Google OAuth redirect working correctly');
      console.log('Redirect URL contains Google OAuth URL:', res.headers.location.includes('accounts.google.com'));
    } else {
      console.log('❌ Google OAuth redirect not working');
    }
  });

  req1.on('error', (e) => {
    console.error('Error testing Google OAuth:', e.message);
  });

  req1.end();

  // Step 2: Test session persistence after delay
  setTimeout(() => {
    const sessionTestOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET'
    };

    const req2 = http.request(sessionTestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\nSession Test Response:', data);
        console.log('Status:', res.statusCode);
        
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.error === 'No autenticado') {
            console.log('✅ Session management working - correctly showing unauthenticated');
          }
        } catch (e) {
          console.log('❌ Received HTML instead of JSON - Vite intercepting API routes');
        }
      });
    });

    req2.on('error', (e) => {
      console.error('Error testing session:', e.message);
    });

    req2.end();
  }, 1000);
}

testGoogleOAuthFlow();