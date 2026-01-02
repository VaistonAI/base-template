import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea } from 'react-icons/fa';

// --- Mock Data ---

const monthlyData = [
    { name: 'Ene', sales: 4000, profit: 2400, amt: 2400 },
    { name: 'Feb', sales: 3000, profit: 1398, amt: 2210 },
    { name: 'Mar', sales: 2000, profit: 9800, amt: 2290 },
    { name: 'Abr', sales: 2780, profit: 3908, amt: 2000 },
    { name: 'May', sales: 1890, profit: 4800, amt: 2181 },
    { name: 'Jun', sales: 2390, profit: 3800, amt: 2500 },
    { name: 'Jul', sales: 3490, profit: 4300, amt: 2100 },
];

const pieData = [
    { name: 'Móvil', value: 400 },
    { name: 'Desktop', value: 300 },
    { name: 'Tablet', value: 300 },
    { name: 'Otros', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const radarData = [
    { subject: 'Velocidad', A: 120, B: 110, fullMark: 150 },
    { subject: 'Fiabilidad', A: 98, B: 130, fullMark: 150 },
    { subject: 'Seguridad', A: 86, B: 130, fullMark: 150 },
    { subject: 'Usabilidad', A: 99, B: 100, fullMark: 150 },
    { subject: 'Funciones', A: 85, B: 90, fullMark: 150 },
    { subject: 'Soporte', A: 65, B: 85, fullMark: 150 },
];

const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
];

export const ChartsPage: React.FC = () => {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Galería de Gráficas</h2>
                    <p className="text-text-secondary">Visualización de datos avanzados</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <FaChartLine className="text-primary" />
                            Tendencias Mensuales (Línea)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} name="Ventas" />
                                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Ganancias" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Bar Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <FaChartBar className="text-accent-1" />
                            Comparativa de Ventas (Barras)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sales" fill="#8884d8" name="Ventas" />
                                    <Bar dataKey="profit" fill="#82ca9d" name="Ganancias" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Area Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <FaChartArea className="text-success" />
                            Crecimiento Acumulado (Área)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" name="Ventas" />
                                    <Area type="monotone" dataKey="profit" stroke="#82ca9d" fillOpacity={1} fill="url(#colorProfit)" name="Ganancias" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Pie Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <FaChartPie className="text-warning" />
                            Distribución por Dispositivo (Pie)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Radar Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            Análisis Multidimensional (Radar)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis />
                                    <Radar name="Producto A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    <Radar name="Producto B" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                    <Legend />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Scatter Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            Distribución de Puntos (Scatter)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid />
                                    <XAxis type="number" dataKey="x" name="stature" unit="cm" />
                                    <YAxis type="number" dataKey="y" name="weight" unit="kg" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="A school" data={scatterData} fill="#8884d8" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};
