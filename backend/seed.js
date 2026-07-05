// const mongoose = require("mongoose");
// const Credential = require("./models/Credential"); // path adjust kar lena

// const MONGO_URI = "mongodb://127.0.0.1:27017/internalCredentialManager";

// function getRandomRoles() {
//     const allRoles = ["admin", "uiux", "seo", "developer"];
//     const randCount = Math.floor(Math.random() * allRoles.length) + 1;
//     return allRoles.sort(() => 0.5 - Math.random()).slice(0, randCount);
// }

// function getRandomCredentials() {
//     const count = Math.floor(Math.random() * 5) + 2; // 2 to 6 creds
//     const creds = [];
//     for (let i = 1; i <= count; i++) {
//         creds.push({
//             username: `user${i}@project.com`,
//             password: `Pass#${1000 + i}`
//         });
//     }
//     return creds;
// }



// function generateBase32Secret() {
//     return crypto.randomBytes(20).toString("base32");
// }

// async function seed() {
//     try {
//         await mongoose.connect(MONGO_URI);
//         console.log("MongoDB Connected");

//         await Credential.deleteMany();

//         const seedData = [];

//         for (let i = 1; i <= 30; i++) {
//             seedData.push({
//                 projectName: `Project ${i}`,
//                 projectUrl: `https://project${i}.demo.com`,
//                 credentials: getRandomCredentials(),
//                 projectNotes: `Notes for project ${i}`,
//                 roles: getRandomRoles(),
//                 isActive: Math.random() < 0.8 // 80% active
//             });
//         }

//         await Credential.insertMany(seedData);

//         console.log("30 Projects Inserted Successfully!");
//         process.exit(0);

//     } catch (error) {
//         console.error("Seed Error: ", error);
//         process.exit(1);
//     }
// }



// async function seedUsers() {
//     try {
//         await mongoose.connect(MONGO_URI);
//         console.log("MongoDB Connected");

//         await User.deleteMany();
//         console.log("Old users removed");

//         const seedUsers = [];

//         for (let i = 1; i <= 10; i++) {
//             seedUsers.push({
//                 email: `user${i}@example.com`,
//                 password: `Pass@${1000 + i}`,
//                 role: getRandomRole(),
//                 isActive: Math.random() < 0.9, // 90% active
//                 twoFactorEnabled: true,
//                 twoFactorSecret: generateBase32Secret(),
//             });
//         }

//         await User.insertMany(seedUsers);
//         console.log("10 Users inserted successfully!");
//         process.exit(0);

//     } catch (err) {
//         console.error("User seeding error: ", err);
//         process.exit(1);
//     }
// }

// seedUsers();


// seed();






require("dotenv").config();
const mongoose = require("mongoose");
const speakeasy = require("speakeasy");
const bcrypt = require("bcryptjs");

// Models
const Credential = require("./models/Credential");
const User = require("./models/User");

// DB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/internalCredentialManager";

// -----------------------------------------
// Helper Functions
// -----------------------------------------

function getRandomCredentials() {
    const count = Math.floor(Math.random() * 5) + 2;
    const creds = [];
    for (let i = 1; i <= count; i++) {
        creds.push({
            username: `user${i}@project.com`,
            password: `Pass#${1000 + i}`,
        });
    }
    return creds;
}

function getRandomRoles() {
    const allRoles = ["admin", "uiux", "seo", "developer"];
    const randCount = Math.floor(Math.random() * allRoles.length) + 1;
    return allRoles.sort(() => 0.5 - Math.random()).slice(0, randCount);
}

function getRandomRole() {
    const roles = ["admin", "uiux", "seo", "developer"];
    return roles[Math.floor(Math.random() * roles.length)];
}

// -----------------------------------------
// Seed Projects
// -----------------------------------------

async function seedProjects() {
    await Credential.deleteMany();

    const projects = [];

    for (let i = 1; i <= 30; i++) {
        projects.push({
            projectName: `Project ${i}`,
            projectUrl: `https://project${i}.demo.com`,
            credentials: getRandomCredentials(),
            projectNotes: `Notes for project ${i}`,
            roles: getRandomRoles(),
            isActive: Math.random() < 0.8,
        });
    }

    await Credential.insertMany(projects);
    console.log("✓ 30 Projects Inserted Successfully");
}

// -----------------------------------------
// Seed Users (Speakeasy + bcrypt)
// -----------------------------------------

async function seedUsers() {
    await User.deleteMany();

    const users = [];

    for (let i = 1; i <= 20; i++) {
        const email = `user${i}@example.com`;
        const plainPassword = `Pass@${1000 + i}`;
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const secret = speakeasy.generateSecret({
            name: `IG (${email})`,
            length: 20,
        });

        users.push({
            email,
            password: hashedPassword,
            role: getRandomRole(),
            isActive: Math.random() < 0.9,
            twoFactorEnabled: true,
            twoFactorSecret: secret.base32,
        });
    }

    await User.insertMany(users);
    console.log("✓ 10 Users Inserted (bcrypt + 2FA)");
}

// -----------------------------------------
// Run Seeder
// -----------------------------------------

async function seedAll() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected");

        await seedUsers();
        await seedProjects();

        console.log("🔥 Seeding Completed Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seed Error:", err);
        process.exit(1);
    }
}

seedAll();
