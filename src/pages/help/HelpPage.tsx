import React, { useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { FaBook, FaQuestionCircle, FaCog, FaLightbulb, FaChevronRight } from 'react-icons/fa';

type Section = 'how-to-use' | 'how-it-works' | 'why' | 'faq';

export const HelpPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('how-to-use');

    const sections = [
        { id: 'how-to-use' as Section, title: 'Cómo Usar el Sistema', icon: FaBook },
        { id: 'how-it-works' as Section, title: 'Cómo Funciona', icon: FaCog },
        { id: 'why' as Section, title: 'Por Qué Funciona Así', icon: FaLightbulb },
        { id: 'faq' as Section, title: 'Preguntas Frecuentes', icon: FaQuestionCircle },
    ];

    return (
        <MainLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Centro de Ayuda</h2>
                    <p className="text-text-secondary">
                        Encuentra toda la información que necesitas para usar el CRM de manera efectiva
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar de navegación */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-border p-4 sticky top-6">
                            <h3 className="font-semibold text-text-primary mb-4">Secciones</h3>
                            <nav className="space-y-2">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === section.id
                                                ? 'bg-primary text-white'
                                                : 'text-text-secondary hover:bg-background'
                                                }`}
                                        >
                                            <Icon className="text-lg" />
                                            <span className="flex-1 text-left text-sm">{section.title}</span>
                                            {activeSection === section.id && <FaChevronRight />}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-border p-8">
                            {activeSection === 'how-to-use' && <HowToUseSection />}
                            {activeSection === 'how-it-works' && <HowItWorksSection />}
                            {activeSection === 'why' && <WhySection />}
                            {activeSection === 'faq' && <FAQSection />}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const HowToUseSection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Cómo Usar el Sistema</h2>

        <div className="space-y-6">
            <Section title="1. Gestión de Pacientes">
                <p className="text-text-secondary mb-4">
                    El módulo de pacientes te permite administrar toda la información de tus pacientes de manera centralizada.
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                    <li><strong>Crear Paciente:</strong> Haz clic en "Nuevo Paciente" y completa el formulario con datos personales, contacto de emergencia y notas. Recibirás una notificación de confirmación.</li>
                    <li><strong>Editar Paciente:</strong> Haz clic en el ícono de editar (lápiz) en la lista de pacientes para actualizar su información.</li>
                    <li><strong>Buscar Paciente:</strong> Usa la barra de búsqueda para encontrar pacientes por nombre, email o teléfono.</li>
                    <li><strong>Eliminar Paciente:</strong> Haz clic en el ícono de eliminar (basura) y confirma la acción. Se notificará la eliminación.</li>
                    <li><strong>Ordenar y Filtrar:</strong> Ordena por nombre, email, teléfono o estado usando los encabezados de la tabla.</li>
                </ul>
            </Section>

            <Section title="2. Gestión de Consultorios">
                <p className="text-text-secondary mb-4">
                    Administra los espacios físicos donde realizas las consultas.
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                    <li><strong>Crear Consultorio:</strong> Define nombre, dirección, capacidad, equipamiento disponible y notas adicionales.</li>
                    <li><strong>Editar Consultorio:</strong> Actualiza la información según cambios en el espacio o equipamiento.</li>
                    <li><strong>Eliminar Consultorio:</strong> Elimina consultorios que ya no uses. Recibirás una notificación de confirmación.</li>
                    <li><strong>Buscar y Ordenar:</strong> Filtra por nombre, dirección o capacidad para encontrar rápidamente el consultorio que necesitas.</li>
                </ul>
            </Section>

            <Section title="3. Gestión de Consultas">
                <p className="text-text-secondary mb-4">
                    El módulo de Consultas unifica todo en un solo lugar: agenda, notas clínicas y cobro.
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                    <li><strong>Crear Consulta:</strong> Selecciona paciente, psicólogo, consultorio, fecha, hora y duración. Recibirás una notificación al crearla.</li>
                    <li><strong>Registrar Notas:</strong> Durante o después de la consulta, registra motivo, diagnóstico, plan de tratamiento y objetivos para la próxima sesión.</li>
                    <li><strong>Cobrar Consulta:</strong> Ingresa monto y método de pago. Se genera una factura automáticamente y recibirás notificación del pago.</li>
                    <li><strong>Vista de Calendario:</strong> Visualiza todas tus consultas en formato de calendario mensual, semanal o diario.</li>
                    <li><strong>Actualizar Estado:</strong> Marca consultas como programadas, en curso, completadas o canceladas.</li>
                    <li><strong>Eliminar Consulta:</strong> Elimina consultas canceladas o erróneas. Se notificará la eliminación.</li>
                </ul>
            </Section>

            <Section title="4. Facturación">
                <p className="text-text-secondary mb-4">
                    Gestiona los aspectos financieros de tu práctica con facturación automática.
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                    <li><strong>Facturas Automáticas:</strong> Se generan automáticamente al cobrar una consulta con número secuencial (FAC-001, FAC-002, etc.).</li>
                    <li><strong>Crear Factura Manual:</strong> Crea facturas independientes para otros servicios. Recibirás notificación al crearla.</li>
                    <li><strong>Editar Factura:</strong> Actualiza información de facturas pendientes antes de marcarlas como pagadas.</li>
                    <li><strong>Registrar Pago:</strong> Marca facturas como pagadas ingresando monto y método de pago. Recibirás notificación del pago.</li>
                    <li><strong>Eliminar Factura:</strong> Elimina facturas erróneas o canceladas. Se notificará la eliminación.</li>
                    <li><strong>Ver Historial:</strong> Consulta todas las facturas pagadas y pendientes con totales por estado.</li>
                    <li><strong>Buscar y Filtrar:</strong> Encuentra facturas por número, paciente, fecha, monto o estado.</li>
                </ul>
            </Section>

            <Section title="5. Gestión de Usuarios">
                <p className="text-text-secondary mb-4">
                    Solo disponible para administradores. Gestiona los usuarios del sistema y sus permisos.
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                    <li><strong>Invitar Usuario:</strong> Envía invitaciones por email con enlace único que expira en 7 días. Recibirás notificación al enviarla.</li>
                    <li><strong>Compartir Invitación:</strong> Copia el enlace o compártelo directamente por WhatsApp.</li>
                    <li><strong>Asignar Roles:</strong> Define roles al invitar: Administrador, Psicólogo, Recepcionista o Visualizador.</li>
                    <li><strong>Editar Usuario:</strong> Actualiza nombre, email, rol o estado de usuarios existentes. Se notificará la actualización.</li>
                    <li><strong>Activar/Desactivar:</strong> Controla el acceso de usuarios sin eliminar sus datos.</li>
                    <li><strong>Eliminar Usuario:</strong> Elimina usuarios que ya no necesiten acceso. Recibirás notificación de la eliminación.</li>
                    <li><strong>Revocar Invitación:</strong> Cancela invitaciones pendientes que ya no sean necesarias. Se notificará la revocación.</li>
                    <li><strong>Ver Permisos:</strong> Consulta los permisos específicos de cada rol en el modal "Permisos por Rol".</li>
                </ul>
            </Section>

            <Section title="6. Sistema de Notificaciones">
                <p className="text-text-secondary mb-4">
                    Mantente informado de todas las acciones importantes en el sistema.
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                    <li><strong>Notificaciones en Tiempo Real:</strong> Recibe notificaciones instantáneas de todas las operaciones CRUD.</li>
                    <li><strong>Campana de Notificaciones:</strong> El ícono de campana en el header muestra un contador de notificaciones no leídas.</li>
                    <li><strong>Panel de Notificaciones:</strong> Haz clic en la campana para ver todas tus notificaciones pendientes.</li>
                    <li><strong>Marcar como Leída:</strong> Haz clic en cualquier notificación para marcarla como leída y que desaparezca del panel.</li>
                    <li><strong>Marcar Todas:</strong> Usa el botón "Marcar todas como leídas" para limpiar todas las notificaciones de una vez.</li>
                    <li><strong>Tipos de Notificaciones:</strong> Pacientes, Consultorios, Consultas, Facturas, Pagos, Usuarios e Invitaciones.</li>
                </ul>
            </Section>
        </div>
    </div>
);

const HowItWorksSection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Cómo Funciona</h2>

        <Section title="Sistema de Permisos">
            <p className="text-text-secondary mb-4">
                Cada usuario tiene un rol que determina sus permisos:
            </p>
            <div className="bg-background rounded-lg p-4 space-y-3">
                <div>
                    <strong className="text-primary">Administrador:</strong>
                    <p className="text-text-secondary text-sm">Acceso total al sistema, gestión de usuarios y configuración.</p>
                </div>
                <div>
                    <strong className="text-primary">Psicólogo:</strong>
                    <p className="text-text-secondary text-sm">Gestión de pacientes, citas, sesiones, facturación y reportes.</p>
                </div>
                <div>
                    <strong className="text-primary">Recepcionista:</strong>
                    <p className="text-text-secondary text-sm">Gestión de pacientes, citas y facturación básica.</p>
                </div>
            </div>
        </Section>
    </div>
);

const WhySection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Por Qué Funciona Así</h2>

        <Section title="Beneficios del Sistema">
            <p className="text-text-secondary mb-4">
                Ventajas de usar este CRM:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li><strong>Centralización:</strong> Toda la información en un solo lugar.</li>
                <li><strong>Accesibilidad:</strong> Accede desde cualquier dispositivo con internet.</li>
                <li><strong>Seguridad:</strong> Datos encriptados y protegidos por Firebase.</li>
                <li><strong>Escalabilidad:</strong> Crece con tu práctica sin necesidad de cambios.</li>
                <li><strong>Actualizaciones:</strong> Mejoras continuas sin interrupciones.</li>
            </ul>
        </Section>
    </div>
);

const FAQSection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Preguntas Frecuentes</h2>

        <div className="space-y-4">
            <FAQ
                question="¿Cómo creo un nuevo paciente?"
                answer="Ve al módulo 'Pacientes' en el sidebar, haz clic en 'Nuevo Paciente', completa el formulario con los datos requeridos (nombre, apellido, email, teléfono, fecha de nacimiento, dirección y contacto de emergencia) y haz clic en 'Crear'. Recibirás una notificación de confirmación y el paciente aparecerá inmediatamente en la lista."
            />

            <FAQ
                question="¿Cómo invito a un nuevo usuario al sistema?"
                answer="Solo los administradores pueden invitar usuarios. Ve a 'Gestión de Usuarios', haz clic en 'Invitar Usuario', completa el formulario con nombre, email y rol (Administrador, Psicólogo, Recepcionista o Visualizador). Se generará un enlace único que expira en 7 días. Puedes copiarlo o compartirlo directamente por WhatsApp. Recibirás una notificación cuando la invitación sea enviada."
            />

            <FAQ
                question="¿Qué pasa si una invitación expira?"
                answer="Las invitaciones expiran después de 7 días por seguridad. Si una invitación expira, simplemente crea una nueva invitación para el mismo usuario. También puedes revocar invitaciones pendientes que ya no necesites desde la lista de invitaciones."
            />

            <FAQ
                question="¿Cómo funciona el sistema de notificaciones?"
                answer="El sistema envía notificaciones en tiempo real para todas las operaciones importantes: crear, actualizar o eliminar pacientes, consultorios, consultas, facturas, usuarios e invitaciones. También recibes notificaciones cuando se registran pagos. Las notificaciones aparecen en la campana del header con un contador. Haz clic en cualquier notificación para marcarla como leída, o usa 'Marcar todas como leídas' para limpiarlas todas."
            />

            <FAQ
                question="¿Cómo funciona la facturación automática?"
                answer="Cuando cobras una consulta, el sistema genera automáticamente una factura con número secuencial (FAC-001, FAC-002, etc.). La factura incluye los datos del paciente, monto, impuestos y método de pago. También puedes crear facturas manuales para otros servicios. Recibirás notificaciones al crear facturas y al registrar pagos."
            />

            <FAQ
                question="¿Puedo editar una factura después de crearla?"
                answer="Sí, puedes editar facturas que estén en estado 'Pendiente'. Una vez que una factura se marca como 'Pagada', no se puede editar para mantener la integridad del historial financiero. Si necesitas corregir una factura pagada, debes eliminarla y crear una nueva."
            />

            <FAQ
                question="¿Cómo registro el pago de una factura?"
                answer="En el módulo 'Facturación', encuentra la factura pendiente y haz clic en el botón de pago (ícono de dólar). Ingresa el monto y método de pago. El sistema actualizará automáticamente el estado de la factura a 'Pagada' y recibirás una notificación de confirmación."
            />

            <FAQ
                question="¿Puedo eliminar una consulta programada?"
                answer="Sí, puedes eliminar consultas desde el módulo 'Consultas'. Sin embargo, es recomendable cambiar el estado a 'Cancelada' en lugar de eliminarla para mantener un historial completo. Al eliminar una consulta, recibirás una notificación de confirmación."
            />

            <FAQ
                question="¿Cómo veo el historial de un paciente?"
                answer="En el módulo 'Consultas', puedes filtrar por paciente para ver todas sus consultas pasadas y futuras. Cada consulta muestra las notas clínicas, diagnóstico, plan de tratamiento y estado de pago. También puedes ver las facturas asociadas en el módulo 'Facturación'."
            />

            <FAQ
                question="¿Qué diferencia hay entre los roles de usuario?"
                answer="Administrador: acceso total al sistema, gestión de usuarios y configuración. Psicólogo: gestión de pacientes, consultas, notas clínicas y facturación. Recepcionista: gestión de citas, pacientes y consultorios (sin acceso a notas clínicas). Visualizador: solo lectura de información sin capacidad de edición. Puedes ver los permisos detallados en el modal 'Permisos por Rol' en Gestión de Usuarios."
            />

            <FAQ
                question="¿Los datos están seguros?"
                answer="Sí, todos los datos están almacenados en Firebase con encriptación en tránsito y en reposo. Las reglas de seguridad de Firestore garantizan que cada usuario solo pueda acceder a los datos para los que tiene permisos. Además, las notificaciones son privadas y solo visibles para el usuario que las genera."
            />

            <FAQ
                question="¿Puedo acceder desde mi celular?"
                answer="Sí, el sistema es completamente responsive y funciona perfectamente en dispositivos móviles, tablets y computadoras de escritorio. Todas las funcionalidades están optimizadas para pantallas táctiles."
            />

            <FAQ
                question="¿Qué hago si olvidé mi contraseña?"
                answer="En la pantalla de login, haz clic en 'Olvidé mi contraseña' y sigue las instrucciones para restablecerla mediante tu correo electrónico. Recibirás un enlace de Firebase para crear una nueva contraseña."
            />

            <FAQ
                question="¿Puedo buscar y filtrar información?"
                answer="Sí, todos los módulos principales (Pacientes, Consultorios, Consultas, Facturas, Usuarios) tienen barras de búsqueda y opciones de ordenamiento. Puedes buscar por nombre, email, fecha, número de factura, etc. También puedes ordenar las listas haciendo clic en los encabezados de las columnas."
            />

            <FAQ
                question="¿El sistema hace backups automáticos?"
                answer="Sí, Firebase realiza backups automáticos diarios de toda la base de datos. Tus datos están protegidos contra pérdidas. Además, cada operación queda registrada con fecha y usuario que la realizó para trazabilidad completa."
            />

            <FAQ
                question="¿Las notificaciones se eliminan automáticamente?"
                answer="No, las notificaciones permanecen hasta que las marques como leídas. Puedes marcarlas individualmente haciendo clic en ellas, o usar el botón 'Marcar todas como leídas' para limpiar todas las notificaciones de una vez. Esto te permite revisar las notificaciones a tu propio ritmo."
            />
        </div>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-l-4 border-primary pl-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>
        {children}
    </div>
);

const FAQ: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
    <div className="bg-background rounded-lg p-4">
        <h4 className="font-semibold text-text-primary mb-2 flex items-start gap-2">
            <FaQuestionCircle className="text-primary mt-1 flex-shrink-0" />
            {question}
        </h4>
        <p className="text-text-secondary text-sm pl-6">{answer}</p>
    </div>
);
