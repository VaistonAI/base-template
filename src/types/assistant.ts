export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface AIModel {
    id: string;
    name: string;
    provider: string;
    contextWindow: number;
    active: boolean;
}

export const OPENROUTER_MODELS: AIModel[] = [
    {
        id: 'mistralai/mistral-small-3.1-24b',
        name: 'Mistral Small 3.1 24B',
        provider: 'Mistral AI',
        contextWindow: 128000,
        active: true
    },
    {
        id: 'moonshotai/kimi-k2-0711',
        name: 'Kimi K2 0711',
        provider: 'MoonshotAI',
        contextWindow: 33000,
        active: true
    },
    {
        id: 'qwen/qwen3-4b',
        name: 'Qwen3 4B',
        provider: 'Qwen',
        contextWindow: 41000,
        active: true
    },
    {
        id: 'meta-llama/llama-3.2-3b-instruct',
        name: 'Llama 3.2 3B Instruct',
        provider: 'Meta',
        contextWindow: 131000,
        active: true
    },
    {
        id: 'google/gemma-3-4b',
        name: 'Gemma 3 4B',
        provider: 'Google',
        contextWindow: 33000,
        active: true
    },
    {
        id: 'google/gemma-3-12b',
        name: 'Gemma 3 12B',
        provider: 'Google',
        contextWindow: 33000,
        active: true
    },
    {
        id: 'arcee-ai/trinity-mini',
        name: 'Trinity Mini',
        provider: 'Arcee AI',
        contextWindow: 131000,
        active: true
    },
    {
        id: 'google/gemma-3n-2b',
        name: 'Gemma 3n 2B',
        provider: 'Google',
        contextWindow: 8000,
        active: true
    },
    {
        id: 'google/gemma-3n-4b',
        name: 'Gemma 3n 4B',
        provider: 'Google',
        contextWindow: 8000,
        active: true
    }
];
