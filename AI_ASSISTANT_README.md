# Asistente Virtual AI - Instrucciones de Configuración

## ⚠️ IMPORTANTE: Configurar API Key

Para que el asistente funcione, necesitas agregar la API key de OpenRouter al archivo `.env`:

1. Abre o crea el archivo `.env` en la raíz del proyecto:
   ```
   c:\Users\Rodrigo\Desktop\CRM\crm-general\.env
   ```

2. Agrega esta línea:
   ```
   VITE_OPENROUTER_API_KEY=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
   ```

3. Guarda el archivo

4. **REINICIA el servidor de desarrollo** para que tome la variable:
   ```bash
   # Detén el servidor (Ctrl+C)
   # Vuelve a iniciarlo
   npm run dev
   ```

## Funcionalidades Implementadas

✅ **9 Modelos de IA Gratuitos** con fallback automático:
1. Mistral Small 3.1 24B (128K context)
2. Kimi K2 0711 (33K context)
3. Qwen3 4B (41K context)
4. Llama 3.2 3B Instruct (131K context)
5. Gemma 3 4B (33K context)
6. Gemma 3 12B (33K context)
7. Trinity Mini (131K context)
8. Gemma 3n 2B (8K context)
9. Gemma 3n 4B (8K context)

✅ **Sistema de Fallback Inteligente**:
- Si un modelo falla, automáticamente prueba el siguiente
- Si todos fallan, usa respuestas predefinidas basadas en keywords
- Siempre obtienes una respuesta

✅ **Interfaz de Chat Moderna**:
- Botón flotante en esquina inferior derecha
- Panel de chat responsive
- Historial de conversación
- Indicador de "escribiendo..."
- Preguntas rápidas sugeridas
- Timestamps en español
- Botón para limpiar chat

✅ **Contexto Completo del CRM**:
- Información sobre todos los módulos
- CRUD operations detalladas
- Sistema de notificaciones
- Roles y permisos
- Navegación y ubicación de funcionalidades

## Cómo Usar

1. Haz click en el botón flotante con el ícono de robot (🤖) en la esquina inferior derecha
2. Escribe tu pregunta sobre el sistema
3. El asistente responderá usando los modelos de IA en orden
4. Puedes usar las preguntas rápidas para empezar
5. Click en "Limpiar chat" para reiniciar la conversación

## Ejemplos de Preguntas

- "¿Cómo creo un paciente?"
- "¿Cómo funciona la facturación automática?"
- "¿Cómo invito a un nuevo usuario?"
- "¿Qué son las notificaciones?"
- "¿Cuáles son los roles disponibles?"
- "¿Cómo cobro una consulta?"
- "¿Dónde veo el historial de un paciente?"

## Notas Técnicas

- El asistente solo responde sobre USO del sistema (no sobre código o arquitectura)
- Mantiene historial de los últimos 5 mensajes para contexto
- Respuestas limitadas a 500 tokens para ser concisas
- Temperature 0.7 para balance entre creatividad y precisión
