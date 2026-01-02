import { firebaseService } from './firebaseService';
import { where, Timestamp } from 'firebase/firestore';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';
import type { Invoice } from '../types/invoice';
import type { User } from '../types/user';

export interface UserDataContext {
    todayConsultations: number;
    todayRevenue: number;
    monthRevenue: number;
    totalPatients: number;
    activePatients: number;
    pendingInvoices: number;
    todayConsultationsList: Array<{
        patientName: string;
        time: string;
        status: string;
    }>;
}

export interface PsychologistSummary {
    psychologistId: string;
    psychologistName: string;
    todayConsultations: number;
}

export interface RoleBasedData {
    role: string;
    userName: string;
    todayConsultations: number;
    psychologistsSummary?: PsychologistSummary[]; // Para recepcionistas
    consultationsList?: Array<{
        patientName: string;
        time: string;
        status: string;
    }>;
}

export class AIDataService {
    // Método para psicólogos: obtener solo SUS consultas
    async getPsychologistData(psychologistId: string): Promise<RoleBasedData> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            console.log('🔍 Buscando consultas para psicólogo:', psychologistId);
            console.log('📅 Rango de fechas:', { today, tomorrow });

            // Obtener TODAS las consultas y filtrar en memoria
            // Esto evita problemas con índices compuestos en Firestore
            const allConsultations = await firebaseService.getAll<Consultation>('consultations');

            console.log('📊 Total de consultas en DB:', allConsultations.length);

            // Filtrar por psicólogo y fecha en memoria
            const todayConsultations = allConsultations.filter(consultation => {
                const consultationDate = consultation.date.toDate();
                const isPsychologist = consultation.psychologistId === psychologistId;
                const isToday = consultationDate >= today && consultationDate < tomorrow;

                if (isPsychologist) {
                    console.log('✅ Consulta del psicólogo:', {
                        id: consultation.id,
                        patientName: consultation.patientName,
                        date: consultationDate,
                        isToday
                    });
                }

                return isPsychologist && isToday;
            });

            console.log('📊 Consultas encontradas para hoy:', todayConsultations.length);

            // Obtener pacientes para nombres
            const patients = await firebaseService.getAll<Patient>('patients');

            const consultationsList = todayConsultations.map(consultation => {
                const patient = patients.find(p => p.id === consultation.patientId);
                const consultationDate = consultation.date.toDate();
                return {
                    patientName: patient ? `${patient.firstName} ${patient.lastName}` : consultation.patientName || 'Paciente desconocido',
                    time: consultationDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                    status: consultation.status || 'programada'
                };
            });

            // Obtener usuario para nombre
            const user = await firebaseService.getById<User>('users', psychologistId);

            return {
                role: 'psychologist',
                userName: user?.displayName || 'Psicólogo',
                todayConsultations: todayConsultations.length,
                consultationsList
            };
        } catch (error) {
            console.error('Error getting psychologist data:', error);
            return {
                role: 'psychologist',
                userName: 'Psicólogo',
                todayConsultations: 0,
                consultationsList: []
            };
        }
    }

    // Método para recepcionistas: obtener resumen de TODOS los psicólogos
    async getReceptionistData(receptionistId: string): Promise<RoleBasedData> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Obtener todas las consultas de hoy
            const todayConsultations = await firebaseService.getAll<Consultation>(
                'consultations',
                where('date', '>=', Timestamp.fromDate(today)),
                where('date', '<', Timestamp.fromDate(tomorrow))
            );

            // Obtener todos los usuarios psicólogos
            const allUsers = await firebaseService.getAll<User>('users');
            const psychologists = allUsers.filter(u => u.role === 'psychologist');

            // Agrupar consultas por psicólogo
            const psychologistsSummary: PsychologistSummary[] = psychologists.map(psychologist => {
                const psychologistConsultations = todayConsultations.filter(
                    c => c.psychologistId === psychologist.uid
                );
                return {
                    psychologistId: psychologist.uid,
                    psychologistName: psychologist.displayName,
                    todayConsultations: psychologistConsultations.length
                };
            }).filter(p => p.todayConsultations > 0); // Solo mostrar psicólogos con consultas

            // Obtener nombre del recepcionista
            const user = await firebaseService.getById<User>('users', receptionistId);

            return {
                role: 'receptionist',
                userName: user?.displayName || 'Recepcionista',
                todayConsultations: todayConsultations.length,
                psychologistsSummary
            };
        } catch (error) {
            console.error('Error getting receptionist data:', error);
            return {
                role: 'receptionist',
                userName: 'Recepcionista',
                todayConsultations: 0,
                psychologistsSummary: []
            };
        }
    }

    // Método para administradores: resumen general
    async getAdminData(adminId: string): Promise<RoleBasedData> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Obtener todas las consultas de hoy
            const todayConsultations = await firebaseService.getAll<Consultation>(
                'consultations',
                where('date', '>=', Timestamp.fromDate(today)),
                where('date', '<', Timestamp.fromDate(tomorrow))
            );

            // Obtener usuario para nombre
            const user = await firebaseService.getById<User>('users', adminId);

            return {
                role: 'admin',
                userName: user?.displayName || 'Administrador',
                todayConsultations: todayConsultations.length
            };
        } catch (error) {
            console.error('Error getting admin data:', error);
            return {
                role: 'admin',
                userName: 'Administrador',
                todayConsultations: 0
            };
        }
    }

    async getUserDataContext(_userId: string): Promise<UserDataContext> {
        try {
            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get month's date range
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            // Get patients
            const patients = await firebaseService.getAll<Patient>('patients');
            const activePatients = patients.filter(p => p.status === 'active');

            // Get today's consultations
            const todayConsultations = await firebaseService.getAll<Consultation>(
                'consultations',
                where('date', '>=', Timestamp.fromDate(today)),
                where('date', '<', Timestamp.fromDate(tomorrow))
            );

            // Get today's invoices
            const todayInvoices = await firebaseService.getAll<Invoice>(
                'invoices',
                where('issueDate', '>=', Timestamp.fromDate(today)),
                where('issueDate', '<', Timestamp.fromDate(tomorrow))
            );

            const todayRevenue = todayInvoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + inv.total, 0);

            // Get month's invoices
            const monthInvoices = await firebaseService.getAll<Invoice>(
                'invoices',
                where('issueDate', '>=', Timestamp.fromDate(firstDayOfMonth))
            );

            const monthRevenue = monthInvoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + inv.total, 0);

            const pendingInvoices = monthInvoices.filter(inv => inv.status === 'pending').length;

            // Format today's consultations list
            const todayConsultationsList = todayConsultations.map(consultation => {
                const patient = patients.find(p => p.id === consultation.patientId);
                const consultationDate = consultation.date.toDate();
                return {
                    patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente desconocido',
                    time: consultationDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                    status: consultation.status || 'programada'
                };
            });

            return {
                todayConsultations: todayConsultations.length,
                todayRevenue,
                monthRevenue,
                totalPatients: patients.length,
                activePatients: activePatients.length,
                pendingInvoices,
                todayConsultationsList
            };
        } catch (error) {
            console.error('Error getting user data context:', error);
            return {
                todayConsultations: 0,
                todayRevenue: 0,
                monthRevenue: 0,
                totalPatients: 0,
                activePatients: 0,
                pendingInvoices: 0,
                todayConsultationsList: []
            };
        }
    }

    formatDataContext(data: UserDataContext): string {
        let context = `\n\n## DATOS ACTUALES DEL USUARIO:\n\n`;
        context += `- Consultas hoy: ${data.todayConsultations}\n`;
        context += `- Ingresos hoy: $${data.todayRevenue.toLocaleString('es-MX')}\n`;
        context += `- Ingresos del mes: $${data.monthRevenue.toLocaleString('es-MX')}\n`;
        context += `- Total pacientes: ${data.totalPatients}\n`;
        context += `- Pacientes activos: ${data.activePatients}\n`;
        context += `- Facturas pendientes: ${data.pendingInvoices}\n`;

        if (data.todayConsultationsList.length > 0) {
            context += `\nConsultas de hoy:\n`;
            data.todayConsultationsList.forEach((consultation, index) => {
                context += `${index + 1}. ${consultation.patientName} - ${consultation.time} (${consultation.status})\n`;
            });
        }

        context += `\n**INSTRUCCIÓN**: Cuando te pregunten sobre estos datos, responde DIRECTAMENTE con la información. Ejemplo: "Hoy has ganado $800" o "Tienes 3 consultas hoy". NO des instrucciones de cómo buscar la información en el sistema a menos que te lo pidan explícitamente.\n`;

        return context;
    }
}

export const aiDataService = new AIDataService();
