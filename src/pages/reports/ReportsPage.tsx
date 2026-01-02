import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { firebaseService } from '../../services/firebaseService';
import { FaUsers, FaCalendarCheck, FaDollarSign, FaChartLine, FaFileInvoice, FaUserCheck, FaMoneyBillWave } from 'react-icons/fa';
import type { Patient } from '../../types/patient';
import type { Invoice } from '../../types/invoice';

export const ReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPatients: 0,
        activePatients: 0,
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        cancelledAppointments: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
        monthRevenue: 0,
        avgRevenuePerPatient: 0,
        completionRate: 0,
        collectionRate: 0,
    });

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const [patients, consultations, invoices] = await Promise.all([
                firebaseService.getAll<Patient>('patients'),
                firebaseService.getAll<any>('consultations'),
                firebaseService.getAll<Invoice>('invoices'),
            ]);

            const activePatients = patients.filter(p => p.status === 'active');

            // Consultas completadas y pendientes
            const completedConsultations = consultations.filter((c: any) => c.status === 'completed');
            const pendingConsultations = consultations.filter((c: any) => c.status === 'scheduled' || c.status === 'pending');
            const cancelledConsultations = consultations.filter((c: any) => c.status === 'cancelled');

            // Facturas pagadas y pendientes
            const paidInvoices = invoices.filter(inv => inv.status === 'paid');
            const pendingInvoices = invoices.filter(inv => inv.status === 'pending');

            const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
            const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

            // Ingresos del mes actual
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            firstDayOfMonth.setHours(0, 0, 0, 0);

            const monthRevenue = paidInvoices
                .filter(inv => {
                    const invoiceDate = inv.paidDate ? inv.paidDate.toDate() : inv.issueDate.toDate();
                    return invoiceDate >= firstDayOfMonth && invoiceDate <= now;
                })
                .reduce((sum, inv) => sum + inv.total, 0);

            const avgRevenuePerPatient = activePatients.length > 0
                ? totalRevenue / activePatients.length
                : 0;

            const completionRate = consultations.length > 0
                ? (completedConsultations.length / consultations.length) * 100
                : 0;

            const collectionRate = invoices.length > 0
                ? (paidInvoices.length / invoices.length) * 100
                : 0;

            setStats({
                totalPatients: patients.length,
                activePatients: activePatients.length,
                totalAppointments: consultations.length,
                completedAppointments: completedConsultations.length,
                pendingAppointments: pendingConsultations.length,
                cancelledAppointments: cancelledConsultations.length,
                totalInvoices: invoices.length,
                paidInvoices: paidInvoices.length,
                pendingInvoices: pendingInvoices.length,
                totalRevenue,
                pendingRevenue,
                monthRevenue,
                avgRevenuePerPatient,
                completionRate,
                collectionRate,
            });
        } catch (error) {
            console.error('Error loading reports:', error);
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

    const reportCards = [
        {
            title: 'Pacientes',
            stats: [
                { label: 'Total Registrados', value: stats.totalPatients },
                { label: 'Activos', value: stats.activePatients },
            ],
            icon: <FaUsers className="text-4xl text-primary" />,
            bgColor: 'bg-primary/10',
        },
        {
            title: 'Citas',
            stats: [
                { label: 'Total', value: stats.totalAppointments },
                { label: 'Completadas', value: stats.completedAppointments },
                { label: 'Pendientes', value: stats.pendingAppointments },
            ],
            icon: <FaCalendarCheck className="text-4xl text-info" />,
            bgColor: 'bg-info/10',
        },
        {
            title: 'Facturas',
            stats: [
                { label: 'Total Emitidas', value: stats.totalInvoices },
                { label: 'Pagadas', value: stats.paidInvoices },
                { label: 'Pendientes', value: stats.pendingInvoices },
            ],
            icon: <FaFileInvoice className="text-4xl text-accent-1" />,
            bgColor: 'bg-accent-1/10',
        },
        {
            title: 'Ingresos Totales',
            stats: [
                { label: 'Cobrado', value: `$${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                { label: 'Por Cobrar', value: `$${stats.pendingRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            ],
            icon: <FaDollarSign className="text-4xl text-success" />,
            bgColor: 'bg-success/10',
        },
        {
            title: 'Ingresos del Mes',
            stats: [
                { label: 'Total', value: `$${stats.monthRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                { label: 'Promedio/Paciente', value: `$${stats.avgRevenuePerPatient.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            ],
            icon: <FaChartLine className="text-4xl text-warning" />,
            bgColor: 'bg-warning/10',
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-text-primary">Reportes y Estadísticas</h2>
                    <p className="text-text-secondary mt-1">Analiza el rendimiento de tu práctica</p>
                </div>

                {/* Tarjetas de métricas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportCards.map((card, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text-primary">{card.title}</h3>
                                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="space-y-2">
                                {card.stats.map((stat, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-text-secondary text-sm">{stat.label}:</span>
                                        <span className="text-text-primary font-semibold">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Resumen Ejecutivo */}
                <Card>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                        Resumen Ejecutivo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-text-primary mb-3">Indicadores de Desempeño</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between p-3 bg-background rounded-lg">
                                    <span className="text-text-secondary">Tasa de Completación de Citas:</span>
                                    <span className="font-medium text-text-primary">
                                        {stats.completionRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between p-3 bg-background rounded-lg">
                                    <span className="text-text-secondary">Tasa de Cobro:</span>
                                    <span className="font-medium text-text-primary">
                                        {stats.collectionRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between p-3 bg-background rounded-lg">
                                    <span className="text-text-secondary">Ingreso Promedio por Paciente:</span>
                                    <span className="font-medium text-text-primary">
                                        ${stats.avgRevenuePerPatient.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between p-3 bg-background rounded-lg">
                                    <span className="text-text-secondary">Citas Canceladas:</span>
                                    <span className="font-medium text-text-primary">
                                        {stats.cancelledAppointments}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-text-primary mb-3">Estado Financiero</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between p-3 bg-success/10 rounded-lg">
                                    <span className="text-success font-medium">Total Cobrado:</span>
                                    <span className="font-semibold text-success">
                                        ${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between p-3 bg-warning/10 rounded-lg">
                                    <span className="text-warning font-medium">Por Cobrar:</span>
                                    <span className="font-semibold text-warning">
                                        ${stats.pendingRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between p-3 bg-primary/10 rounded-lg">
                                    <span className="text-primary font-medium">Ingresos del Mes:</span>
                                    <span className="font-semibold text-primary">
                                        ${stats.monthRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between p-3 bg-info/10 rounded-lg">
                                    <span className="text-info font-medium">Facturas Pendientes:</span>
                                    <span className="font-semibold text-info">
                                        {stats.pendingInvoices}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Métricas Adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Tasa de Completación</p>
                                <p className="text-3xl font-bold text-success">
                                    {stats.completionRate.toFixed(1)}%
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                    {stats.completedAppointments} de {stats.totalAppointments} citas
                                </p>
                            </div>
                            <div className="p-3 bg-success/10 rounded-lg">
                                <FaUserCheck className="text-3xl text-success" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Tasa de Cobro</p>
                                <p className="text-3xl font-bold text-primary">
                                    {stats.collectionRate.toFixed(1)}%
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                    {stats.paidInvoices} de {stats.totalInvoices} facturas
                                </p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <FaMoneyBillWave className="text-3xl text-primary" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Pacientes Activos</p>
                                <p className="text-3xl font-bold text-info">
                                    {stats.activePatients}
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                    de {stats.totalPatients} registrados
                                </p>
                            </div>
                            <div className="p-3 bg-info/10 rounded-lg">
                                <FaUsers className="text-3xl text-info" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};
