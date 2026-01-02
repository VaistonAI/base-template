import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { firebaseService } from '../../services/firebaseService';
import { FaLightbulb, FaChartLine, FaBrain, FaExclamationTriangle } from 'react-icons/fa';
import type { Patient } from '../../types/patient';
import type { Appointment } from '../../types/appointment';
import type { Session } from '../../types/session';

interface Insight {
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    icon: React.ReactNode;
}

export const InsightsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<Insight[]>([]);

    useEffect(() => {
        generateInsights();
    }, []);

    const generateInsights = async () => {
        try {
            const [patients, appointments, sessions] = await Promise.all([
                firebaseService.getAll<Patient>('patients'),
                firebaseService.getAll<Appointment>('appointments'),
                firebaseService.getAll<Session>('sessions'),
            ]);

            const generatedInsights: Insight[] = [];

            // Insight 1: Pacientes activos
            const activePatients = patients.filter(p => p.status === 'active');
            if (activePatients.length > 0) {
                generatedInsights.push({
                    type: 'success',
                    title: 'Base de Pacientes Saludable',
                    description: `Tienes ${activePatients.length} pacientes activos. Esto representa un ${((activePatients.length / patients.length) * 100).toFixed(0)}% de tu base total.`,
                    icon: <FaChartLine className="text-2xl" />,
                });
            }

            // Insight 2: Citas canceladas
            const cancelledAppointments = appointments.filter(a => a.status === 'cancelled' || a.status === 'no_show');
            const cancellationRate = (cancelledAppointments.length / appointments.length) * 100;
            if (cancellationRate > 15) {
                generatedInsights.push({
                    type: 'warning',
                    title: 'Alta Tasa de Cancelaciones',
                    description: `El ${cancellationRate.toFixed(1)}% de tus citas han sido canceladas o no asistidas. Considera implementar recordatorios automáticos.`,
                    icon: <FaExclamationTriangle className="text-2xl" />,
                });
            }

            // Insight 3: Promedio de sesiones
            const avgSessions = sessions.length / activePatients.length;
            if (avgSessions > 5) {
                generatedInsights.push({
                    type: 'success',
                    title: 'Excelente Retención de Pacientes',
                    description: `Tus pacientes tienen un promedio de ${avgSessions.toFixed(1)} sesiones, lo que indica una buena adherencia al tratamiento.`,
                    icon: <FaBrain className="text-2xl" />,
                });
            } else if (avgSessions < 3) {
                generatedInsights.push({
                    type: 'info',
                    title: 'Oportunidad de Mejora en Retención',
                    description: `El promedio de sesiones por paciente es ${avgSessions.toFixed(1)}. Considera estrategias para mejorar la continuidad del tratamiento.`,
                    icon: <FaBrain className="text-2xl" />,
                });
            }

            // Insight 4: Citas próximas
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            const upcomingAppointments = appointments.filter(a => {
                const aptDate = a.date.toDate();
                return aptDate >= today && aptDate <= nextWeek && a.status === 'scheduled';
            });

            if (upcomingAppointments.length > 0) {
                generatedInsights.push({
                    type: 'info',
                    title: 'Citas Próximas',
                    description: `Tienes ${upcomingAppointments.length} citas programadas para los próximos 7 días. Asegúrate de confirmarlas.`,
                    icon: <FaLightbulb className="text-2xl" />,
                });
            }

            // Insight 5: Pacientes sin sesiones recientes
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentSessions = sessions.filter(s => s.date.toDate() >= thirtyDaysAgo);
            const patientsWithRecentSessions = new Set(recentSessions.map(s => s.patientId));
            const inactivePatients = activePatients.filter(p => !patientsWithRecentSessions.has(p.id));

            if (inactivePatients.length > 0) {
                generatedInsights.push({
                    type: 'warning',
                    title: 'Pacientes sin Sesiones Recientes',
                    description: `${inactivePatients.length} pacientes activos no han tenido sesiones en los últimos 30 días. Considera hacer seguimiento.`,
                    icon: <FaExclamationTriangle className="text-2xl" />,
                });
            }

            setInsights(generatedInsights);
        } catch (error) {
            console.error('Error generating insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            </MainLayout>
        );
    }

    const getInsightStyle = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-l-4 border-success bg-success/5';
            case 'warning':
                return 'border-l-4 border-warning bg-warning/5';
            case 'info':
                return 'border-l-4 border-info bg-info/5';
            default:
                return 'border-l-4 border-primary bg-primary/5';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-success';
            case 'warning':
                return 'text-warning';
            case 'info':
                return 'text-info';
            default:
                return 'text-primary';
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-text-primary">Insights con IA</h2>
                    <p className="text-text-secondary mt-1">
                        Análisis inteligente y recomendaciones para tu práctica
                    </p>
                </div>

                <Card className="bg-gradient-to-r from-primary/10 to-accent-1/10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white rounded-full">
                            <FaBrain className="text-4xl text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-text-primary mb-1">
                                Análisis Inteligente Activado
                            </h3>
                            <p className="text-text-secondary">
                                Nuestro sistema analiza tus datos para brindarte insights accionables y mejorar tu práctica
                            </p>
                        </div>
                    </div>
                </Card>

                {insights.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <FaLightbulb className="text-6xl text-text-secondary opacity-20 mx-auto mb-4" />
                            <p className="text-text-secondary">
                                No hay suficientes datos para generar insights. Continúa usando el sistema.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                            <Card key={index} className={getInsightStyle(insight.type)}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 ${getIconColor(insight.type)}`}>
                                        {insight.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                                            {insight.title}
                                        </h3>
                                        <p className="text-text-secondary">
                                            {insight.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Card>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                        Recomendaciones Personalizadas
                    </h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-background rounded-lg">
                            <h4 className="font-medium text-text-primary mb-2">📅 Optimiza tu Agenda</h4>
                            <p className="text-sm text-text-secondary">
                                Considera agrupar citas similares en bloques de tiempo para mejorar tu eficiencia.
                            </p>
                        </div>
                        <div className="p-4 bg-background rounded-lg">
                            <h4 className="font-medium text-text-primary mb-2">💰 Mejora tu Flujo de Caja</h4>
                            <p className="text-sm text-text-secondary">
                                Implementa recordatorios de pago automáticos para reducir facturas pendientes.
                            </p>
                        </div>
                        <div className="p-4 bg-background rounded-lg">
                            <h4 className="font-medium text-text-primary mb-2">📊 Análisis de Tendencias</h4>
                            <p className="text-sm text-text-secondary">
                                Revisa tus reportes mensuales para identificar patrones y oportunidades de crecimiento.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                        Próximas Funcionalidades de IA
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border-2 border-dashed border-border rounded-lg">
                            <h4 className="font-medium text-text-primary mb-2">🤖 Asistente Virtual</h4>
                            <p className="text-sm text-text-secondary">
                                Respuestas automáticas a preguntas frecuentes de pacientes
                            </p>
                        </div>
                        <div className="p-4 border-2 border-dashed border-border rounded-lg">
                            <h4 className="font-medium text-text-primary mb-2">📈 Predicción de Demanda</h4>
                            <p className="text-sm text-text-secondary">
                                Anticipa períodos de alta demanda para optimizar tu disponibilidad
                            </p>
                        </div>
                        <div className="p-4 border-2 border-dashed border-border rounded-lg">
                            <h4 className="font-medium text-text-primary mb-2">🎯 Segmentación Inteligente</h4>
                            <p className="text-sm text-text-secondary">
                                Agrupa pacientes por características para tratamientos personalizados
                            </p>
                        </div>
                        <div className="p-4 border-2 border-dashed border-border rounded-lg">
                            <h4 className="font-medium text-text-primary mb-2">📝 Notas Automáticas</h4>
                            <p className="text-sm text-text-secondary">
                                Generación de resúmenes de sesiones con IA
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};
