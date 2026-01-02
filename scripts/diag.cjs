const admin = require('firebase-admin');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../serviceAccountKey.json');

async function diag() {
    console.log("Diagnóstico Firebase Admin...");

    try {
        const serviceAccount = require(SERVICE_ACCOUNT_PATH);
        console.log("Project ID en JSON:", serviceAccount.project_id);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log("Intentando listar usuarios...");
        const listUsersResult = await admin.auth().listUsers(1);
        console.log("Usuarios encontrados:", listUsersResult.users.length);
        listUsersResult.users.forEach(u => console.log("- " + u.email));

    } catch (e) {
        console.error("Error Diagnóstico:", e);
    }
}

diag();
