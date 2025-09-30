#!/usr/bin/env node
import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🧪 Probando API de login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@parqueadero.com',
        password: 'password'
      })
    });
    
    const data = await response.json();
    console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login exitoso!');
      console.log('🎟️ Token:', data.token);
    } else {
      console.log('❌ Login falló:', data.error);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testLogin();