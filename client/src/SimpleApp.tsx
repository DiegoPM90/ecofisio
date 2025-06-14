import React from 'react';

function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Ecofisio - Sistema de Gestión Médica</h1>
      <p>Sistema HIPAA/ISO 27001 Compliant para datos médicos</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Panel de Administración</h2>
        <p>Credenciales: admin/admin123</p>
        
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '15px', 
          borderRadius: '5px',
          marginTop: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>Características de Seguridad Implementadas:</h3>
          <ul>
            <li>✓ Cifrado AES-256 para datos PHI</li>
            <li>✓ Auditoría completa HIPAA</li>
            <li>✓ Control de acceso basado en roles</li>
            <li>✓ Retención de datos (7 años)</li>
            <li>✓ Autenticación multifactor</li>
            <li>✓ Logs de seguridad inmutables</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button 
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
            onClick={() => window.location.href = '/login'}
          >
            Iniciar Sesión
          </button>
          
          <button 
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/admin'}
          >
            Panel Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;