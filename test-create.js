import { netxCreateCustomer } from './server/telemetry-service.js';

async function run() {
  const res = await netxCreateCustomer({
    username: 'mbn@testapi2',
    password: 'password123',
    name: 'test user',
    phone: '01712345678',
    address: 'Kalkini',
    package: '35M'
  });
  console.log(res);
}
run();
