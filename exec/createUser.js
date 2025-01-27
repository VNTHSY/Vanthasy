const readline = require('readline');
const { db } = require('../handlers/db.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const CatLoggr = require('cat-loggr');
const log = new CatLoggr();
const saltRounds = process.env.SALT_ROUNDS || 10;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// for command-line arguments
function parseArguments() {
    const args = {};
    process.argv.slice(2).forEach(arg => {
        const [key, value] = arg.split('=');
        if (key.startsWith('--')) {
            args[key.slice(2)] = value;
        }
    });
    return args;
}

async function doesUserExist(username) {
    const users = await db.get('users');
    return users.find(user => user.username === username);
}

async function doesEmailExist(email) {
    const users = await db.get('users');
    return users.find(user => user.email === email);
}

async function initializeUsersTable(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();
    const users = [{ userId, username, email, password: hashedPassword, accessTo: [], admin: true, verified: true }];
    return db.set('users', users);
}

async function addUserToUsersTable(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();
    const users = await db.get('users') || [];
    users.push({ userId, username, email, password: hashedPassword, accessTo: [], admin: false, verified: false });
    return db.set('users', users);
}

async function createUser(username, email, password) {
    const users = await db.get('users');
    if (!users) {
        await initializeUsersTable(username, email, password);
    } else {
        return addUserToUsersTable(username, email, password);
    }
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function main() {
    const args = parseArguments();

    let username, email, password;

    if (args.username && args.email && args.password) {
        username = args.username;
        email = args.email;
        password = args.password;
    } else {
        log.init('Create a new *admin* user fot the Overvoid Panel');
        log.init('You can make regular users from the admin -> users page');

        username = await askQuestion('Username: ');
        email = await askQuestion('Email: ');

        if (!isValidEmail(email)) {
            log.error('Invalid email address.');
            rl.close();
            return;
        }

        password = await askQuestion('Password: ');
    }

    const userExists = await doesUserExist(username);
    const emailExists = await doesEmailExist(email);
    if (userExists || emailExists) {
        log.error('User already exists with that username or email.');
        rl.close();
        return;
    }

    try {
        await createUser(username, email, password);
        log.info('User created successfully.');
    } catch (error) {
        log.error(`Failed to create user: ${error}`);
    } finally {
        rl.close();
    }
}

main().catch(err => {
    console.error('Unexpected error:', err);
    rl.close();
});