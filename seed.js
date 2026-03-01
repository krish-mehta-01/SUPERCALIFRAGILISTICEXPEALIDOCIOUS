// Seed script for demo data
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./database/vehicle_identity.db');

async function seed() {
    console.log('🌱 Seeding database...');

    // Create owners
    const owners = [
        { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', phone: '555-0101' },
        { first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', phone: '555-0102' },
        { first_name: 'Bob', last_name: 'Johnson', email: 'bob.j@example.com', phone: '555-0103' }
    ];

    const ownerIds = [];

    for (let owner of owners) {
        const owner_id = uuidv4();
        ownerIds.push(owner_id);
        const password_hash = await bcrypt.hash('password123', 10);

        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO owners (owner_id, first_name, last_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?, ?)`,
                [owner_id, owner.first_name, owner.last_name, owner.email, owner.phone, password_hash],
                (err) => { if (err) reject(err); else resolve(); });
        });
    }

    console.log('✅ Owners created');

    // Create vehicles
    const vehicles = [
        { vin: '1HGCM82633A123456', reg: 'ABC-1234', make: 'Honda', model: 'Accord', year: 2023, owner_idx: 0 },
        { vin: '5XYZU3LB7EG123456', reg: 'XYZ-7890', make: 'Toyota', model: 'Camry', year: 2022, owner_idx: 1 },
        { vin: 'JM1BK32F581123456', reg: 'DEF-5678', make: 'Mazda', model: 'CX-5', year: 2024, owner_idx: 2 },
        { vin: 'WAULFAFR9DA123456', reg: 'GHI-9012', make: 'Audi', model: 'A4', year: 2023, owner_idx: 0 }
    ];

    const vehicleIds = [];

    for (let v of vehicles) {
        const vehicle_id = uuidv4();
        vehicleIds.push(vehicle_id);

        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO vehicles (vehicle_id, vin, registration_number, make, model, year, color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [vehicle_id, v.vin, v.reg, v.make, v.model, v.year, 'Silver', 'active'],
                (err) => { if (err) reject(err); else resolve(); });
        });

        // Create ownership
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO vehicle_ownership (vehicle_id, owner_id, ownership_start_date, is_current) VALUES (?, ?, DATE('now'), 1)`,
                [vehicle_id, ownerIds[v.owner_idx]],
                (err) => { if (err) reject(err); else resolve(); });
        });
    }

    console.log('✅ Vehicles created');

    // Create insurance
    const insurances = [
        { vehicle_idx: 0, policy: 'POL-001', provider: 'SafeDrive', type: 'comprehensive', coverage: 50000 },
        { vehicle_idx: 1, policy: 'POL-002', provider: 'AutoGuard', type: 'comprehensive', coverage: 45000 },
        { vehicle_idx: 2, policy: 'POL-003', provider: 'CarProtect', type: 'third_party', coverage: 25000 }
    ];

    for (let ins of insurances) {
        const insurance_id = uuidv4();

        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO insurance (insurance_id, vehicle_id, policy_number, provider_name, insurance_type, coverage_amount, premium_amount, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, DATE('now'), DATE('now', '+1 year'))`,
                [insurance_id, vehicleIds[ins.vehicle_idx], ins.policy, ins.provider, ins.type, ins.coverage, 1000],
                (err) => { if (err) reject(err); else resolve(); });
        });
    }

    console.log('✅ Insurance created');
    console.log('🎉 Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log('Email: john.doe@example.com');
    console.log('Password: password123');

    db.close();
}

seed().catch(console.error);
