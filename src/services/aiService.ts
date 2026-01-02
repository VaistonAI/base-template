import { OPENROUTER_MODELS } from '../types/assistant';
import type { ChatMessage } from '../types/assistant';
import { SYSTEM_CONTEXT } from '../config/assistantContext';
import { aiDataService } from './aiDataService';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export class AIService {
    private currentModelIndex = 0;
    private conversationHistory: ChatMessage[] = [];
    private userDataContext: string = '';

    // Lista de palabras clave prohibidas
    private forbiddenKeywords = [
        'base de datos', 'database', 'firestore', 'firebase', 'mongodb', 'sql',
        'código', 'code', 'typescript', 'javascript', 'react', 'componente',
        'api key', 'token', 'credencial', 'password', 'contraseña',
        'hackear', 'hack', 'infiltrar', 'vulnerabilidad', 'exploit',
        'backend', 'servidor', 'server', 'arquitectura', 'deployment',
        'generar código', 'crear código', 'escribir código',
        'reglas de firestore', 'security rules', 'authentication',
        'como funciona internamente', 'estructura técnica', 'implementación',
        'crear crud', 'generar crud', 'hacer crud', 'modificar base'
    ];

    private isForbiddenTopic(message: string): boolean {
        const lowerMessage = message.toLowerCase();
        return this.forbiddenKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    async sendMessage(userMessage: string): Promise<string> {
        // Verificar si la pregunta es sobre temas prohibidos
        if (this.isForbiddenTopic(userMessage)) {
            return 'Lo siento, solo puedo ayudarte con información sobre cómo usar el sistema como usuario. Para temas técnicos, de seguridad o desarrollo, consulta con el administrador del sistema.';
        }

        // Agregar mensaje del usuario al historial
        this.conversationHistory.push({
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        // Intentar con cada modelo en orden
        for (let i = 0; i < OPENROUTER_MODELS.length; i++) {
            const modelIndex = (this.currentModelIndex + i) % OPENROUTER_MODELS.length;
            const model = OPENROUTER_MODELS[modelIndex];

            if (!model.active) continue;

            try {
                console.log(`🤖 Intentando con modelo: ${model.name}`);

                const response = await this.callOpenRouter(model.id, userMessage);

                // Verificar si la respuesta contiene información prohibida
                if (this.isForbiddenTopic(response)) {
                    return 'Lo siento, solo puedo ayudarte con información sobre cómo usar el sistema como usuario. Para temas técnicos, de seguridad o desarrollo, consulta con el administrador del sistema.';
                }

                // Si funciona, actualizar el índice del modelo actual
                this.currentModelIndex = modelIndex;

                // Agregar respuesta al historial
                this.conversationHistory.push({
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response,
                    timestamp: new Date()
                });

                console.log(`✅ Respuesta exitosa de: ${model.name}`);
                return response;
            } catch (error) {
                console.warn(`❌ Error con ${model.name}:`, error);
                // Continuar con el siguiente modelo
                continue;
            }
        }

        // Si todos los modelos fallan, usar respuesta de fallback
        console.log('⚠️ Todos los modelos fallaron, usando fallback');
        return this.getFallbackResponse(userMessage);
    }

    private async callOpenRouter(modelId: string, message: string): Promise<string> {
        if (!API_KEY) {
            throw new Error('API key no configurada');
        }

        const messages = [
            {
                role: 'system',
                content: SYSTEM_CONTEXT + this.userDataContext
            },
            // Incluir últimos 5 mensajes del historial para contexto
            ...this.conversationHistory.slice(-5).map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ];

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'CRM Psicología'
            },
            body: JSON.stringify({
                model: modelId,
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'No pude generar una respuesta.';
    }

    private getFallbackResponse(message: string): string {
        const lowerMessage = message.toLowerCase();

        // Verificar temas prohibidos primero
        if (this.isForbiddenTopic(lowerMessage)) {
            return 'Lo siento, solo puedo ayudarte con información sobre cómo usar el sistema como usuario. Para temas técnicos, de seguridad o desarrollo, consulta con el administrador del sistema.';
        }

        // Respuestas rápidas basadas en keywords
        if (lowerMessage.includes('paciente') && lowerMessage.includes('crear')) {
            return 'Para crear un paciente: Ve a "Pacientes" en el sidebar → Click "Nuevo Paciente" → Completa el formulario con nombre, apellido, email, teléfono, fecha de nacimiento, dirección y contacto de emergencia → Click "Crear". Recibirás una notificación de confirmación.';
        }

        if (lowerMessage.includes('consulta') && lowerMessage.includes('crear')) {
            return 'Para crear una consulta: Ve a "Consultas" → Click "Nueva Consulta" → Selecciona paciente, psicólogo, consultorio, fecha, hora y duración → Click "Crear". Recibirás una notificación.';
        }

        if (lowerMessage.includes('factura') || lowerMessage.includes('cobrar')) {
            return 'Las facturas se generan automáticamente al cobrar una consulta. También puedes crear facturas manuales en el módulo "Facturación". Para cobrar una consulta: ingresa el monto y método de pago, se generará la factura automáticamente con número secuencial (FAC-001, FAC-002, etc.).';
        }

        if (lowerMessage.includes('usuario') && lowerMessage.includes('invitar')) {
            return 'Para invitar un usuario (solo administradores): Ve a "Gestión de Usuarios" → Click "Invitar Usuario" → Completa email, nombre y rol → Se genera un enlace único válido por 7 días → Compártelo por copia o WhatsApp. Recibirás una notificación.';
        }

        if (lowerMessage.includes('notificacion')) {
            return 'Las notificaciones aparecen en la campana (🔔) del header superior derecha. Click en la campana para ver el panel de notificaciones. Click en cualquier notificación para marcarla como leída, o usa "Marcar todas como leídas".';
        }

        if (lowerMessage.includes('rol') || lowerMessage.includes('permiso')) {
            return 'Roles disponibles: Administrador (acceso total), Psicólogo (pacientes, consultas, notas, facturación), Recepcionista (citas, pacientes, consultorios sin notas clínicas), Visualizador (solo lectura). Puedes ver los permisos detallados en "Gestión de Usuarios" → "Permisos por Rol".';
        }

        if (lowerMessage.includes('buscar') || lowerMessage.includes('filtrar')) {
            return 'Todos los módulos principales tienen barra de búsqueda. Puedes buscar por nombre, email, teléfono, número de factura, etc. También puedes ordenar las listas haciendo click en los encabezados de las columnas.';
        }

        // Respuesta genérica
        return 'Puedo ayudarte con información sobre cómo usar el CRM. Pregúntame sobre: crear pacientes, consultas, facturas, invitar usuarios, notificaciones, roles y permisos, o cualquier funcionalidad del sistema. También puedes consultar la página de "Ayuda" para más información detallada.';
    }

    clearHistory(): void {
        this.conversationHistory = [];
    }

    async loadUserDataContext(userId: string): Promise<void> {
        try {
            const data = await aiDataService.getUserDataContext(userId);
            this.userDataContext = aiDataService.formatDataContext(data);
        } catch (error) {
            console.error('Error loading user data context:', error);
            this.userDataContext = '';
        }
    }

    getHistory(): ChatMessage[] {
        return this.conversationHistory;
    }
}

export const aiService = new AIService();
