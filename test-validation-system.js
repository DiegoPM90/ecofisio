#!/usr/bin/env node

/**
 * Comprehensive Validation System Test
 * Tests all duplicate prevention measures implemented in the booking system
 */

const API_BASE = 'http://localhost:5000';

// Test data for validation scenarios
const testAppointment = {
  patientName: "Test Usuario",
  email: "test@example.com",
  phone: "+56912345678",
  specialty: "fisioterapia",
  reason: "dolor",
  reasonDetail: "Dolor de espalda baja",
  sessions: 1,
  date: "2025-06-21", // Next Saturday
  time: "10:00"
};

async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function testDuplicateTimeSlot() {
  console.log('\n🧪 TEST 1: Duplicate Time Slot Prevention');
  
  // Attempt to create first appointment
  const first = await makeRequest('/api/appointments', 'POST', testAppointment);
  console.log(`First appointment: ${first.status} - ${first.ok ? 'SUCCESS' : first.data.error || 'FAILED'}`);
  
  // Attempt to create duplicate appointment (same time)
  const duplicate = await makeRequest('/api/appointments', 'POST', testAppointment);
  console.log(`Duplicate attempt: ${duplicate.status} - ${duplicate.data.error || 'UNEXPECTED SUCCESS'}`);
  
  if (duplicate.status === 409 && duplicate.data.error === 'SLOT_TAKEN') {
    console.log('✅ Duplicate time slot prevention: WORKING');
  } else {
    console.log('❌ Duplicate time slot prevention: FAILED');
  }
  
  return first.ok ? first.data.id : null;
}

async function testDuplicateEmail() {
  console.log('\n🧪 TEST 2: Duplicate Email Prevention');
  
  // Attempt to create appointment with same email, different time
  const sameEmailDifferentTime = {
    ...testAppointment,
    email: "test@example.com",
    time: "11:00"
  };
  
  const result = await makeRequest('/api/appointments', 'POST', sameEmailDifferentTime);
  console.log(`Same email, different time: ${result.status} - ${result.data.error || 'UNEXPECTED SUCCESS'}`);
  
  if (result.status === 409 && result.data.error === 'DUPLICATE_EMAIL') {
    console.log('✅ Duplicate email prevention: WORKING');
  } else {
    console.log('❌ Duplicate email prevention: FAILED');
  }
}

async function testInvalidDay() {
  console.log('\n🧪 TEST 3: Invalid Day Validation');
  
  // Attempt to create appointment on a non-Saturday
  const weekdayAppointment = {
    ...testAppointment,
    email: "weekday@example.com",
    date: "2025-06-20" // Friday
  };
  
  const result = await makeRequest('/api/appointments', 'POST', weekdayAppointment);
  console.log(`Weekday appointment: ${result.status} - ${result.data.error || 'UNEXPECTED SUCCESS'}`);
  
  if (result.status === 400 && result.data.error === 'INVALID_DAY') {
    console.log('✅ Invalid day validation: WORKING');
  } else {
    console.log('❌ Invalid day validation: FAILED');
  }
}

async function testInvalidTime() {
  console.log('\n🧪 TEST 4: Invalid Time Validation');
  
  // Attempt to create appointment outside allowed hours
  const invalidTimeAppointment = {
    ...testAppointment,
    email: "invalidtime@example.com",
    time: "15:00" // 3 PM, outside 10-13 range
  };
  
  const result = await makeRequest('/api/appointments', 'POST', invalidTimeAppointment);
  console.log(`Invalid time appointment: ${result.status} - ${result.data.error || 'UNEXPECTED SUCCESS'}`);
  
  if (result.status === 400 && result.data.error === 'INVALID_TIME') {
    console.log('✅ Invalid time validation: WORKING');
  } else {
    console.log('❌ Invalid time validation: FAILED');
  }
}

async function testPastDate() {
  console.log('\n🧪 TEST 5: Past Date Validation');
  
  // Attempt to create appointment in the past
  const pastDateAppointment = {
    ...testAppointment,
    email: "pastdate@example.com",
    date: "2025-06-14" // Past Saturday
  };
  
  const result = await makeRequest('/api/appointments', 'POST', pastDateAppointment);
  console.log(`Past date appointment: ${result.status} - ${result.data.error || 'UNEXPECTED SUCCESS'}`);
  
  if (result.status === 400 && result.data.error === 'PAST_DATE') {
    console.log('✅ Past date validation: WORKING');
  } else {
    console.log('❌ Past date validation: FAILED');
  }
}

async function testDateFullLimit() {
  console.log('\n🧪 TEST 6: Date Full Limit (4 appointments max)');
  
  const appointments = [];
  const times = ['10:00', '11:00', '12:00', '13:00'];
  
  // Try to create 4 appointments for the same date
  for (let i = 0; i < 4; i++) {
    const appointment = {
      ...testAppointment,
      email: `user${i+1}@example.com`,
      time: times[i],
      date: "2025-06-28" // Different Saturday to avoid conflicts
    };
    
    const result = await makeRequest('/api/appointments', 'POST', appointment);
    if (result.ok) {
      appointments.push(result.data);
      console.log(`Appointment ${i+1}: Created successfully`);
    } else {
      console.log(`Appointment ${i+1}: Failed - ${result.data.error}`);
    }
  }
  
  // Try to create a 5th appointment (should fail)
  const fifthAppointment = {
    ...testAppointment,
    email: "fifth@example.com",
    time: "10:00", // Try to take an already occupied slot
    date: "2025-06-28"
  };
  
  const result = await makeRequest('/api/appointments', 'POST', fifthAppointment);
  console.log(`Fifth appointment attempt: ${result.status} - ${result.data.error || 'UNEXPECTED SUCCESS'}`);
  
  if (result.status === 409 && (result.data.error === 'DATE_FULL' || result.data.error === 'SLOT_TAKEN')) {
    console.log('✅ Date full limit validation: WORKING');
  } else {
    console.log('❌ Date full limit validation: FAILED');
  }
  
  return appointments;
}

async function testAvailableSlots() {
  console.log('\n🧪 TEST 7: Available Slots API');
  
  // Check available slots for the test date
  const result = await makeRequest('/api/appointments/available-slots/2025-06-21/fisioterapia');
  console.log(`Available slots result: ${result.status}`);
  
  if (result.ok) {
    console.log(`Available slots: ${JSON.stringify(result.data)}`);
    console.log('✅ Available slots API: WORKING');
  } else {
    console.log('❌ Available slots API: FAILED');
  }
}

async function cleanup(appointmentIds) {
  console.log('\n🧹 CLEANUP: Removing test appointments');
  
  for (const id of appointmentIds.filter(Boolean)) {
    try {
      const result = await makeRequest(`/api/appointments/${id}`, 'DELETE');
      console.log(`Deleted appointment ${id}: ${result.ok ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.log(`Error deleting appointment ${id}: ${error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE VALIDATION SYSTEM TEST');
  console.log('='.repeat(60));
  
  const createdAppointments = [];
  
  try {
    // Test 1: Duplicate time slot prevention
    const firstAppointmentId = await testDuplicateTimeSlot();
    if (firstAppointmentId) createdAppointments.push(firstAppointmentId);
    
    // Test 2: Duplicate email prevention
    await testDuplicateEmail();
    
    // Test 3: Invalid day validation
    await testInvalidDay();
    
    // Test 4: Invalid time validation
    await testInvalidTime();
    
    // Test 5: Past date validation
    await testPastDate();
    
    // Test 6: Date full limit
    const dateFullAppointments = await testDateFullLimit();
    createdAppointments.push(...dateFullAppointments.map(apt => apt.id));
    
    // Test 7: Available slots API
    await testAvailableSlots();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL VALIDATION TESTS COMPLETED');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    // Cleanup created test data
    await cleanup(createdAppointments);
  }
}

// Check if we can reach the server
async function checkServerConnection() {
  console.log('🔌 Checking server connection...');
  const result = await makeRequest('/api/appointments');
  
  if (result.status === 0) {
    console.log('❌ Cannot connect to server. Make sure the server is running on port 5000.');
    process.exit(1);
  } else {
    console.log('✅ Server connection established');
  }
}

// Run the test suite
checkServerConnection().then(() => {
  runAllTests().catch(console.error);
});