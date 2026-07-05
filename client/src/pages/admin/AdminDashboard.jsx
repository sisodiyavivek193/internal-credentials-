import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { KeyRound, Users } from 'lucide-react';
import api from '@/services/api_axios';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalUsers: null,
        totalCredentials: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Reuse existing paginated endpoints (limit=1) just to read the totals.
                const [usersRes, credsRes] = await Promise.all([
                    api.get('/admin/users', { params: { page: 1, limit: 1 } }),
                    api.get('/admin/credentials', { params: { page: 1, limit: 1 } }),
                ]);

                setStats({
                    totalUsers: usersRes.data?.pagination?.total ?? usersRes.data?.data?.length ?? 0,
                    totalCredentials: credsRes.data?.pagination?.total ?? 0,
                });
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/login', { replace: true });
                } else {
                    console.error('Dashboard stats fetch error:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            onClick: () => navigate('/admin/users'),
        },
        {
            title: 'Total Credentials',
            value: stats.totalCredentials,
            icon: KeyRound,
            onClick: () => navigate('/admin/credentials'),
        },
    ];

    return (
        <div>
            <div className="mb-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Overview of your credentials and users
                </p>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ title, value, icon: Icon, onClick }) => (
                    <Card
                        key={title}
                        onClick={onClick}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardDescription className="px-6 text-2xl font-bold text-foreground">
                            {loading ? '—' : value}
                        </CardDescription>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;