import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaFileContract, FaUserShield, FaLock } from 'react-icons/fa';

export const TermsAndConditions: React.FC = () => {
    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <FaFileContract className="text-6xl text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-text-primary mb-2">Términos y Condiciones</h1>
                    <p className="text-text-secondary">Última actualización: Diciembre 2024</p>
                </div>

                {/* Contenido */}
                <div className="space-y-8 text-text-secondary">
                    {/* Sección 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <FaShieldAlt className="text-primary" />
                            1. Aceptación de Términos
                        </h2>
                        <p className="mb-4">
                            Al acceder y utilizar este sistema CRM de Psicología (en adelante, "el Sistema"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar el Sistema.
                        </p>
                        <p>
                            Este es un sistema de demostración proporcionado únicamente con fines ilustrativos. El uso de este sistema implica la aceptación total de estos términos.
                        </p>
                    </section>

                    {/* Sección 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">2. Naturaleza del Sistema</h2>
                        <p className="mb-4">
                            Este Sistema es una <strong>versión de demostración</strong> diseñada para mostrar las capacidades y funcionalidades de un CRM especializado en gestión de consultorios de psicología.
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Los datos ingresados son únicamente para fines de prueba</li>
                            <li>No se garantiza la persistencia de los datos</li>
                            <li>El sistema puede ser reiniciado o modificado sin previo aviso</li>
                            <li>No debe utilizarse para gestionar información real de pacientes</li>
                        </ul>
                    </section>

                    {/* Sección 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">3. Opciones de Adquisición</h2>
                        <p className="mb-4">El Sistema está disponible bajo dos modalidades:</p>

                        <div className="bg-background rounded-lg p-6 mb-4">
                            <h3 className="text-xl font-semibold text-primary mb-3">Opción 1: Compra de Código Fuente</h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Adquisición completa del código fuente</li>
                                <li>Licencia de uso perpetuo</li>
                                <li>Posibilidad de personalización ilimitada</li>
                                <li>Soporte técnico inicial incluido</li>
                            </ul>
                        </div>

                        <div className="bg-background rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-primary mb-3">Opción 2: Renta Mensual</h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Costo: <strong>$399 MXN/mes</strong></li>
                                <li>Acceso completo al sistema</li>
                                <li>Actualizaciones automáticas incluidas</li>
                                <li>Soporte técnico continuo</li>
                                <li>Hosting y mantenimiento incluidos</li>
                            </ul>
                        </div>
                    </section>

                    {/* Sección 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <FaUserShield className="text-primary" />
                            4. Privacidad y Protección de Datos
                        </h2>
                        <p className="mb-4">
                            Nos comprometemos a proteger la privacidad de los usuarios:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Los datos se almacenan de forma segura en Firebase</li>
                            <li>Implementamos encriptación en tránsito y en reposo</li>
                            <li>Cumplimos con las mejores prácticas de seguridad</li>
                            <li>No compartimos información con terceros sin consentimiento</li>
                            <li>Los usuarios tienen derecho a solicitar la eliminación de sus datos</li>
                        </ul>
                    </section>

                    {/* Sección 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <FaLock className="text-primary" />
                            5. Limitación de Responsabilidad
                        </h2>
                        <p className="mb-4">
                            El Sistema se proporciona "TAL CUAL" sin garantías de ningún tipo, ya sean expresas o implícitas:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>No garantizamos disponibilidad ininterrumpida del servicio</li>
                            <li>No nos hacemos responsables por pérdida de datos en la versión demo</li>
                            <li>El usuario es responsable del uso adecuado del sistema</li>
                            <li>No nos responsabilizamos por decisiones tomadas basadas en el sistema</li>
                            <li>La versión demo no debe usarse para datos médicos reales</li>
                        </ul>
                    </section>

                    {/* Sección 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">6. Propiedad Intelectual</h2>
                        <p className="mb-4">
                            Todo el contenido, diseño, código y funcionalidades del Sistema son propiedad exclusiva del desarrollador:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>El código fuente está protegido por derechos de autor</li>
                            <li>No se permite la reproducción sin autorización</li>
                            <li>La compra del código fuente otorga licencia de uso, no transferencia de propiedad intelectual</li>
                        </ul>
                    </section>

                    {/* Sección 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">7. Uso Aceptable</h2>
                        <p className="mb-4">Al utilizar el Sistema, el usuario se compromete a:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>No intentar acceder a áreas restringidas del sistema</li>
                            <li>No realizar ingeniería inversa del código</li>
                            <li>No utilizar el sistema para fines ilegales o no autorizados</li>
                            <li>No intentar comprometer la seguridad del sistema</li>
                            <li>Respetar los derechos de otros usuarios</li>
                        </ul>
                    </section>

                    {/* Sección 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">8. Modificaciones</h2>
                        <p>
                            Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sistema. El uso continuado del Sistema después de dichas modificaciones constituye la aceptación de los nuevos términos.
                        </p>
                    </section>

                    {/* Sección 9 */}
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">9. Contacto</h2>
                        <p className="mb-4">
                            Para consultas sobre estos Términos y Condiciones, opciones de adquisición, o soporte técnico, por favor contacte al administrador del sistema.
                        </p>
                        <div className="bg-primary/10 border border-primary rounded-lg p-4">
                            <p className="text-sm">
                                <strong>Nota:</strong> Al utilizar este sistema de demostración, usted reconoce haber leído, entendido y aceptado estos Términos y Condiciones en su totalidad.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer con botón de regreso */}
                <div className="mt-12 pt-8 border-t border-border">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        ← Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
};
