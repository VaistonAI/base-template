export interface MenuItemConfig {
    path: string;
    label: string;
    icon: string; // Icon name from react-icons/fa (e.g. 'FaHome')
    permission?: string;
}

export interface EntityField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'boolean' | 'currency' | 'rating' | 'url' | 'textarea' | 'file' | 'color';
    options?: string[]; // For select type
    required?: boolean;
}

export interface EntityConfig {
    name: string; // Route path, e.g., 'patients'
    label: string; // Menu label, e.g., 'Pacientes'
    icon: string;
    schema: EntityField[];
}

export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
}

export interface ProjectConfig {
    projectName: string;
    description: string;
    logoUrl?: string; // Optional custom logo
    loginTitle: string;
    loginSubtitle: string;
    menuItems: MenuItemConfig[];
    // Dynamic entities (The UniversalCRUDs)
    entities: EntityConfig[];
    // Theme (managed via CSS vars, but good to have here for reference)
    theme: ThemeConfig;
}
