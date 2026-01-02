const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Configuración
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../serviceAccountKey.json');
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = '$Vaiston123';

async function main() {
    console.log("🚀 Iniciando inyección Backend de Admin...");

    // 1. Verificar archivo de credenciales
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        console.error(`❌ Error: No se encuentra el archivo ${SERVICE_ACCOUNT_PATH}`);
        process.exit(1);
    }

    // 2. Inicializar Firebase Admin
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);

    // Check if already initialized to avoid errors in re-runs (though node process is fresh)
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    let uid = '';

    // 3. Crear o Verificar Usuario en Auth
    try {
        console.log(`🆕 Intentando crear usuario ${ADMIN_EMAIL}...`);
        const userRecord = await auth.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            emailVerified: true,
            displayName: "Admin"
        });
        uid = userRecord.uid;
        console.log("✅ Usuario creado exitosamente en Auth.");
    } catch (error) {
        if (error.code === 'auth/email-already-exists' || error.message.includes('email-already-exists')) {
            console.log("⚠️ El usuario ya existe. Actualizando credenciales...");
            const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
            uid = userRecord.uid;
            await auth.updateUser(uid, {
                password: ADMIN_PASSWORD,
                emailVerified: true,
                displayName: "Admin"
            });
            console.log("✅ Usuario actualizado correctamente.");
        } else {
            console.error("Error inesperado en Auth:", error.code, error.message);
            throw error;
        }
    }

    // 4. Crear/Sobreescribir Perfil en Firestore
    console.log(`💾 Escribiendo perfil en Firestore (UID: ${uid})...`);

    const adminData = {
        uid: uid,
        email: ADMIN_EMAIL,
        displayName: "Admin",
        role: "admin",
        isActive: true,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        permissions: {
            canManageUsers: true,
            canManagePatients: true,
            canManageAppointments: true,
            canManageOffices: true,
            canManageBilling: true,
            canViewReports: true,
            canManageSessions: true
        }
    };

    // Usamos set({merge: true}) para no borrar campos extra si hubieran, 
    // pero asegurando que los datos críticos sean correctos.
    await db.collection('users').doc(uid).set(adminData, { merge: true });

    console.log("✅ Perfil de Firestore actualizado correctamente.");
    console.log("\n🎉 USUARIO ADMIN GENERADO EXITOSAMENTE");
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Pass: ${ADMIN_PASSWORD}`);
}

main().catch(error => {
    console.error("❌ Error Fatal:", error);
    process.exit(1);
});
