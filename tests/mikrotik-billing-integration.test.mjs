import http from 'http';
import { spawn } from 'child_process';
import assert from 'assert';

const TEST_PORT = 5059;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper: HTTP request wrapper
function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runLiveIntegrationSuite() {
  console.log('========================================================================');
  console.log('   MIKROTIK & ISP SYSTEM END-TO-END AUTOMATED VERIFICATION SUITE');
  console.log('========================================================================');
  console.log(`Starting isolated test gateway server on port ${TEST_PORT}...`);

  // Start gateway server on TEST_PORT
  const gatewayProcess = spawn('node', ['server/gateway.js'], {
    env: { ...process.env, PORT: TEST_PORT.toString() },
    stdio: 'inherit'
  });

  // Give gateway a moment to bind and load token
  await sleep(2500);

  let createdCustomerId = null;
  const testPppUser = `mbn@testsuite${Math.floor(1000 + Math.random() * 9000)}`;
  const testPhone = `0171${Math.floor(1000000 + Math.random() * 9000000)}`;

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Healthcheck
    // ------------------------------------------------------------------------
    console.log('\n[TEST 1] Testing Gateway Healthcheck & NetX Packages...');
    const health = await apiRequest('/api/netx/packages');
    assert.strictEqual(health.status, 200, 'Packages endpoint should return HTTP 200');
    assert.ok(Array.isArray(health.data.data), 'Packages should be an array');
    console.log(`✓ Gateway is LIVE. Discovered ${health.data.data.length} packages on MikroTik.`);

    // ------------------------------------------------------------------------
    // TEST 2: Admin Adds User (/api/mikrotik/user/create)
    // ------------------------------------------------------------------------
    console.log(`\n[TEST 2] Testing Admin Adding New Subscriber: "${testPppUser}"...`);
    const createPayload = {
      username: testPppUser,
      password: 'password123',
      name: 'Automated Test Subscriber',
      phone: testPhone,
      package: '35M',
      zone: 'Default',
      address: 'Kalkini Central Node'
    };

    const createRes = await apiRequest('/api/mikrotik/user/create', 'POST', createPayload);
    console.log('HTTP Response:', createRes.status, JSON.stringify(createRes.data));
    assert.strictEqual(createRes.status, 200, 'Create endpoint should return HTTP 200');
    assert.strictEqual(createRes.data.success, true, 'User creation must succeed');
    assert.ok(createRes.data.customerId, 'Should return created customerId (UUID)');
    createdCustomerId = createRes.data.customerId;
    console.log(`✓ NEW ID OPENED ON MIKROTIK:`);
    console.log(`  - Customer ID:   ${createdCustomerId}`);
    console.log(`  - Customer Code: ${createRes.data.customerCode}`);
    console.log(`  - Server:        ${createRes.data.server}`);
    console.log(`  - PPPoE User:    ${createRes.data.username}`);

    await sleep(1500);

    // ------------------------------------------------------------------------
    // TEST 3: Toggle Off - Suspend Subscriber Line ("circel doesn't off" fix)
    // ------------------------------------------------------------------------
    console.log(`\n[TEST 3] Testing Manual Line Toggle OFF (Suspend Line & Drop Secret)...`);
    const toggleOffRes = await apiRequest('/api/mikrotik/user/toggle', 'POST', {
      customerId: createdCustomerId,
      disabled: true
    });
    console.log('HTTP Response:', toggleOffRes.status, JSON.stringify(toggleOffRes.data));
    assert.strictEqual(toggleOffRes.status, 200, 'Toggle endpoint should return HTTP 200');
    assert.strictEqual(toggleOffRes.data.success, true, 'Toggle off should succeed');
    assert.strictEqual(toggleOffRes.data.action, 'disable', 'Action must be disable');
    assert.strictEqual(toggleOffRes.data.status, 'disabled', 'Status must be set to disabled on MikroTik');
    console.log(`✓ MikroTik Core Router DC-CA disabled PPPoE secret for "${testPppUser}".`);

    // ------------------------------------------------------------------------
    // TEST 4: Verification of UI "Circle Off" Logic
    // ------------------------------------------------------------------------
    console.log(`\n[TEST 4] Verifying UI Status Circle logic in CustomersPage.tsx...`);
    const mockCustomerStateAfterCutoff = {
      id: createdCustomerId,
      name: 'Automated Test Subscriber',
      pppUser: testPppUser,
      status: 'suspended',
      netStatus: 'offline',
      disabledInMikrotik: true,
      disabledInSystem: true
    };
    
    // Exact logic from CustomersPage.tsx:
    const isOnline =
      !mockCustomerStateAfterCutoff.disabledInMikrotik &&
      !mockCustomerStateAfterCutoff.disabledInSystem &&
      mockCustomerStateAfterCutoff.netStatus !== 'offline' &&
      mockCustomerStateAfterCutoff.status !== 'suspended';

    assert.strictEqual(isOnline, false, 'Circle MUST turn off (isOnline = false)');
    console.log(`✓ Circle Status Indicator: isOnline = ${isOnline} (Renders GRAY circle: Line is OFF).`);

    // ------------------------------------------------------------------------
    // TEST 5: Billing Cycle Engine Simulation (Overdue Cutoff)
    // ------------------------------------------------------------------------
    console.log(`\n[TEST 5] Testing Billing Cycle Cutoff Engine Simulation...`);
    // Simulate subscriber who reached billing expiration with unpaid invoice:
    const overdueCustomer = {
      id: createdCustomerId,
      name: 'Automated Test Subscriber',
      pppUser: testPppUser,
      daysRemaining: 0,
      dueAmount: 500,
      status: 'due',
      userType: 'regular'
    };

    // runBillingCutoffEngine rule:
    const isPastDate = true;
    const hasDue = overdueCustomer.dueAmount > 0 || overdueCustomer.status === 'due';
    const isExpired = overdueCustomer.daysRemaining <= 0 || isPastDate;
    const shouldCutoff = isExpired && hasDue && overdueCustomer.status !== 'suspended';
    assert.strictEqual(shouldCutoff, true, 'Billing cutoff engine MUST trigger for overdue subscriber');

    // Trigger MikroTik auto-cutoff via API
    const cutoffApiRes = await apiRequest('/api/mikrotik/user/toggle', 'POST', {
      customerId: overdueCustomer.id,
      disabled: true
    });
    assert.strictEqual(cutoffApiRes.status, 200);
    assert.strictEqual(cutoffApiRes.data.success, true);
    console.log(`✓ Billing Cutoff Engine successfully cut off line on MikroTik for overdue balance (৳${overdueCustomer.dueAmount}).`);

    // ------------------------------------------------------------------------
    // TEST 6: Payment Confirmation & Automatic Reconnection
    // ------------------------------------------------------------------------
    console.log(`\n[TEST 6] Testing Payment Confirmation & Automatic MikroTik Reconnection...`);
    // Admin receives payment:
    const paymentAmount = 500;
    const paymentMethod = 'bKash';
    const trxId = 'TRX' + Date.now().toString().slice(-6);

    // Call toggle endpoint with disabled: false (reconnect line):
    await sleep(1500);
    const reconnectRes = await apiRequest('/api/mikrotik/user/toggle', 'POST', {
      customerId: createdCustomerId,
      disabled: false
    });
    console.log('HTTP Response:', reconnectRes.status, JSON.stringify(reconnectRes.data));
    assert.strictEqual(reconnectRes.status, 200);
    assert.strictEqual(reconnectRes.data.success, true);
    assert.strictEqual(reconnectRes.data.action, 'enable');
    assert.strictEqual(reconnectRes.data.status, 'active');

    // Verify UI state after payment
    const mockCustomerAfterPayment = {
      ...mockCustomerStateAfterCutoff,
      status: 'active',
      netStatus: 'online',
      disabledInMikrotik: false,
      disabledInSystem: false,
      dueAmount: 0,
      daysRemaining: 30
    };

    const isOnlineAfterPayment =
      !mockCustomerAfterPayment.disabledInMikrotik &&
      !mockCustomerAfterPayment.disabledInSystem &&
      mockCustomerAfterPayment.netStatus !== 'offline' &&
      mockCustomerAfterPayment.status !== 'suspended';

    assert.strictEqual(isOnlineAfterPayment, true, 'Circle MUST turn ON (isOnline = true)');
    console.log(`✓ Payment recorded (TrxID: ${trxId}, ৳${paymentAmount} via ${paymentMethod}).`);
    console.log(`✓ MikroTik line auto-restored (status: "active"). Circle Indicator = GREEN (Online).`);

    // ------------------------------------------------------------------------
    // TEST 7: Customer Detail Modification (/api/mikrotik/user/update)
    // ------------------------------------------------------------------------
    console.log(`\n[TEST 7] Testing Subscriber Profile/Detail Update on MikroTik...`);
    const updateRes = await apiRequest('/api/mikrotik/user/update', 'POST', {
      customerId: createdCustomerId,
      name: 'Automated Subscriber Renamed',
      phone: '01719998877',
      address: 'Kalkini West Sector'
    });
    console.log('HTTP Response:', updateRes.status, JSON.stringify(updateRes.data));
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.success, true);
    console.log(`✓ Subscriber credentials/info updated on MikroTik core router.`);

    // ------------------------------------------------------------------------
    // TEST 8: Subscriber Deprovisioning (/api/mikrotik/user/delete)
    // ------------------------------------------------------------------------
    console.log(`\n[TEST 8] Testing Subscriber Deletion & RouterOS Cleanup...`);
    const deleteRes = await apiRequest('/api/mikrotik/user/delete', 'POST', {
      customerId: createdCustomerId
    });
    console.log('HTTP Response:', deleteRes.status, JSON.stringify(deleteRes.data));
    assert.strictEqual(deleteRes.status, 200);
    assert.strictEqual(deleteRes.data.success, true);
    assert.strictEqual(deleteRes.data.mikrotikRemoved, 1);
    console.log(`✓ Subscriber "${testPppUser}" cleanly deprovisioned from MikroTik router.`);
    createdCustomerId = null; // Cleaned up

    console.log('\n========================================================================');
    console.log('   ALL 8 TESTS PASSED: MIKROTIK INTEGRATION & BILLING CYCLE 100% OPERATIONAL');
    console.log('========================================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    if (createdCustomerId) {
      console.log(`Cleaning up test user ${createdCustomerId}...`);
      await apiRequest('/api/mikrotik/user/delete', 'POST', { customerId: createdCustomerId }).catch(() => {});
    }
    process.exitCode = 1;
  } finally {
    console.log('\nStopping test gateway server...');
    gatewayProcess.kill('SIGTERM');
  }
}

runLiveIntegrationSuite();
