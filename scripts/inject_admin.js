const https = require('https');

const API_KEY = "AIzaSyDlmVY-O3IKNiwerQC-T57_nwmuTMgxa6M";
const PROJECT_ID = "base-template-294a9";

const EMAIL = "admin@admin.com";
const PASSWORD = "$Vaiston123";

// Helper para hacer request https
function doRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            // Si el error es email exists, lo resolvemos para manejarlo
            if (parsed.error && parsed.error.message === 'EMAIL_EXISTS') {
                resolve({ error: 'EMAIL_EXISTS' });
            } else {
                reject(parsed);
            }
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(body);
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log("🚀 Iniciando inyección directa de Admin...");

  let idToken = '';
  let localId = '';

  // 1. Crear Usuario (SignUp)
  console.log("1️⃣  Creando usuario en Auth...");
  const signUpOptions = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/accounts:signUp?key=${API_KEY}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  
  let authResponse = await doRequest(signUpOptions, {
    email: EMAIL,
    password: PASSWORD,
    returnSecureToken: true
  });

  if (authResponse.error === 'EMAIL_EXISTS') {
    console.log("⚠️  El usuario ya existe. Intentando login para actualizar Firestore...");
    // Login para obtener token
    const signInOptions = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/accounts:signInWithPassword?key=${API_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    authResponse = await doRequest(signInOptions, {
        email: EMAIL,
        password: PASSWORD,
        returnSecureToken: true
    });
    console.log("✅ Login exitoso.");
  } else {
      console.log("✅ Usuario creado exitosamente.");
  }

  idToken = authResponse.idToken;
  localId = authResponse.localId;
  
  if (!idToken || !localId) {
      throw new Error("No se pudo obtener idToken o localId");
  }

  // 2. Crear/Sobreescribir Documento en Firestore
  console.log(`2️⃣  Escribiendo perfil en Firestore (UID: ${localId})...`);
  
  // Estructura de Firestore JSON REST
  const firestoreDoc = {
    fields: {
      uid: { stringValue: localId },
      email: { stringValue: EMAIL },
      displayName: { stringValue: "Admin" },
      role: { stringValue: "admin" }, // UserRole.ADMIN
      isActive: { booleanValue: true },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() },
      // Permisos: map
      permissions: {
        mapValue: {
          fields: {
            canManageUsers: { booleanValue: true },
            canManagePatients: { booleanValue: true },
            canManageAppointments: { booleanValue: true },
            canManageOffices: { booleanValue: true },
            canManageBilling: { booleanValue: true },
            canViewReports: { booleanValue: true },
            canManageSessions: { booleanValue: true }
          }
        }
      }
    }
  };

  const firestorePath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${localId}?key=${API_KEY}`; // PATCH para merge o crear
  // Usamos patch para upsert
  
  const firestoreOptions = {
    hostname: 'firestore.googleapis.com',
    path: firestorePath,
    method: 'PATCH',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}` 
    }
  };

  try {
    const fsResponse = await doRequest(firestoreOptions, firestoreDoc);
    console.log("✅ Documento de Firestore creado/actualizado correctamente.");
    // console.log(JSON.stringify(fsResponse, null, 2));
  } catch (fsError) {
      console.error("❌ Error escribiendo en Firestore. Verifica las Reglas de Seguridad.");
      console.error(JSON.stringify(fsError, null, 2));
      process.exit(1);
  }

  console.log("\n🎉 Proceso completado. El usuario Admin está listo para usar.");
}

main().catch(err => {
    console.error("❌ Error Fatal:", err);
    process.exit(1);
});
