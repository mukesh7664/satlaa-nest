import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Admin, AdminRole } from '../admin/entities/admin.entity';
import * as bcrypt from 'bcryptjs';

const EMAIL = 'pos@fanostyle.com';
const PASSWORD = 'Pos@1234';
const NAME = 'POS Operator';

async function run() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Admin);

    let admin = await repo.findOne({ where: { email: EMAIL } });
    const hashed = await bcrypt.hash(PASSWORD, 10);

    if (admin) {
        admin.password = hashed;
        admin.role = AdminRole.POS_USER;
        admin.name = NAME;
        await repo.save(admin);
        console.log(`Updated existing account -> role=pos_user`);
    } else {
        admin = repo.create({
            name: NAME,
            email: EMAIL,
            password: hashed,
            role: AdminRole.POS_USER,
            permissions: ['pos'],
        });
        await repo.save(admin);
        console.log(`Created new pos_user account`);
    }

    console.log('\n=== POS TEST LOGIN ===');
    console.log(`Email:    ${EMAIL}`);
    console.log(`Password: ${PASSWORD}`);
    console.log(`Role:     pos_user`);
    console.log('======================\n');

    await AppDataSource.destroy();
}

run().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
