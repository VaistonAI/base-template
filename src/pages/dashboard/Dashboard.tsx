import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import {
    FaDatabase,
    FaCheckCircle,
    FaStar,
    FaCube,
    FaChartArea,
    FaChartPie,
    FaList,
    FaPlus,
    FaFileExport
} from 'react-icons/fa';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

// Generic Record Interface (Same as PatientList)
interface GenericRecord {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'active' | 'inactive' | 'pending' | 'completed';
    isActive: boolean;
    isFeatured: boolean;
    quantity: number;
    price: number;
    createdDateTime: string;
}

interface DashboardStats {
    totalRecords: number;
    activeRecords: number;
    featuredRecords: number;
    totalQuantity: number;
    categoryDistribution: { name: string; value: number }[];
    priorityDistribution: { name: string; value: number }[];
}

// Colors for charts
const COLORS = ['#1b527c', '#2d9bf0', '#55bff3', '#0f6cbf', '#e2e8f0'];
const PRIORITY_COLORS = {
    low: '#10B981',    // green
    medium: '#3B82F6', // blue
    high: '#F59E0B',   // yellow
    urgent: '#EF4444'  // red
};

export const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalRecords: 0,
        activeRecords: 0,
        featuredRecords: 0,
        totalQuantity: 0,
        categoryDistribution: [],
        priorityDistribution: []
    });
    const [recentRecords, setRecentRecords] = useState<GenericRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock data for activity chart (Generic trend)
    const activityData = [
        { name: 'Lun', records: 4, updates: 2 },
        { name: 'Mar', records: 3, updates: 5 },
        { name: 'Mié', records: 7, updates: 3 },
        { name: 'Jue', records: 2, updates: 8 },
        { name: 'Vie', records: 6, updates: 4 },
        { name: 'Sáb', records: 9, updates: 7 },
        { name: 'Dom', records: 5, updates: 2 },
    ];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Get all records
            // Using 'patients' collection which is now our Generic CRUD collection
            const records = await firebaseService.getAll<GenericRecord>('patients');

            // Calculate Stats
            const active = records.filter(r => r.status === 'active').length;
            const featured = records.filter(r => r.isFeatured).length;
            const quantity = records.reduce((sum, r) => sum + (r.quantity || 0), 0);

            // Group by Category for Pie Chart
            const catMap = new Map<string, number>();
            records.forEach(r => {
                const cat = r.category || 'Sin Categoría';
                catMap.set(cat, (catMap.get(cat) || 0) + 1);
            });
            const categoryDist = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));

            // Group by Priority for Bar Chart
            const prioMap = new Map<string, number>();
            records.forEach(r => {
                const prio = r.priority || 'low';
                prioMap.set(prio, (prioMap.get(prio) || 0) + 1);
            });
            const priorityDist = Array.from(prioMap.entries()).map(([name, value]) => ({ name, value }));

            // Set Data
            setStats({
                totalRecords: records.length,
                activeRecords: active,
                featuredRecords: featured,
                totalQuantity: quantity,
                categoryDistribution: categoryDist,
                priorityDistribution: priorityDist
            });

            // Get Recent Records (Last 5)
            // Assuming default sorting or client-side sort if createdDateTime exists, otherwise just take last 5
            setRecentRecords(records.slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard data:', error);
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

    const cards = [
        {
            title: 'Total Registros',
            value: stats.totalRecords,
            icon: <FaDatabase />,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            title: 'Registros Activos',
            value: stats.activeRecords,
            icon: <FaCheckCircle />,
            color: 'text-success',
            bg: 'bg-success/10'
        },
        {
            title: 'Destacados',
            value: stats.featuredRecords,
            icon: <FaStar />,
            color: 'text-warning',
            bg: 'bg-warning/10'
        },
        {
            title: 'Volumen Total',
            value: stats.totalQuantity,
            icon: <FaCube />,
            color: 'text-accent-1',
            bg: 'bg-accent-1/10'
        }
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Dashboard General</h2>
                        <p className="text-text-secondary text-sm">Resumen de actividad y estado del sistema</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/patients')}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <FaPlus className="text-sm" />
                            Nuevo Registro
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((card, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-secondary text-sm font-medium mb-1">{card.title}</p>
                                    <h3 className="text-2xl font-bold text-text-primary">{card.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${card.bg} ${card.color} text-xl`}>
                                    {card.icon}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Area Chart */}
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-text-primary flex items-center gap-2">
                                <FaChartArea className="text-primary" />
                                Actividad Reciente
                            </h3>
                            <select className="text-sm border-gray-200 rounded-md text-text-secondary bg-gray-50 p-1">
                                <option>Últimos 7 días</option>
                                <option>Este mes</option>
                                <option>Este año</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2d9bf0" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2d9bf0" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="records" stroke="#2d9bf0" strokeWidth={3} fillOpacity={1} fill="url(#colorRecords)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Distribution Pie Chart */}
                    <Card>
                        <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-6">
                            <FaChartPie className="text-primary" />
                            Distribución por Categoría
                        </h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            {stats.categoryDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.categoryDistribution}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.categoryDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-text-secondary text-sm">No hay datos suficientes</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Bottom Section: Recent List & Priority Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Records List */}
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-text-primary flex items-center gap-2">
                                <FaList className="text-primary" />
                                Registros Recientes
                            </h3>
                            <button
                                onClick={() => navigate('/patients')}
                                className="text-sm text-primary hover:text-primary-dark font-medium hover:underline"
                            >
                                Ver todos
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Título</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Categoría</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Estado</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Prioridad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm font-medium text-text-primary">{record.title}</td>
                                            <td className="py-3 px-4 text-sm text-text-secondary">{record.category || '-'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                    ${record.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        record.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                            record.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {record.status === 'active' ? 'Activo' :
                                                        record.status === 'inactive' ? 'Inactivo' :
                                                            record.status === 'completed' ? 'Completado' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full text-white capitalize`}
                                                    style={{ backgroundColor: PRIORITY_COLORS[record.priority as keyof typeof PRIORITY_COLORS] || '#9CA3AF' }}
                                                >
                                                    {record.priority === 'low' ? 'Baja' :
                                                        record.priority === 'medium' ? 'Media' :
                                                            record.priority === 'high' ? 'Alta' :
                                                                record.priority === 'urgent' ? 'Urgente' : 'Normal'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentRecords.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-text-secondary text-sm">
                                                No hay registros recientes para mostrar
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Priority Bar Chart */}
                    <Card>
                        <h3 className="font-semibold text-text-primary mb-6">Por Prioridad</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.priorityDistribution} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }}
                                        tickFormatter={(val) =>
                                            val === 'low' ? 'Baja' :
                                                val === 'medium' ? 'Media' :
                                                    val === 'high' ? 'Alta' :
                                                        val === 'urgent' ? 'Urg' : val
                                        }
                                    />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="#2d9bf0" radius={[0, 4, 4, 0]}>
                                        {stats.priorityDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#2d9bf0'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};
