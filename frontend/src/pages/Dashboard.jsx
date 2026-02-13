import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideArrowUpRight, LucideArrowDownLeft, LucideWallet, LucideUsers } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        balance: 50000.00, // Mock balance
        payoutsCount: 0,
        beneficiariesCount: 0,
        recentPayouts: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [payoutsRes, beneficiariesRes, userRes] = await Promise.all([
                    api.get('/payouts'),
                    api.get('/payouts/beneficiaries'),
                    api.get('/auth/me')
                ]);

                setStats({
                    balance: userRes.data.user.balance || 0,
                    payoutsCount: payoutsRes.data.length,
                    beneficiariesCount: beneficiariesRes.data.length,
                    recentPayouts: payoutsRes.data.slice(0, 5),
                    userId: userRes.data.user.id
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    Welcome back, User
                </div>
            </div>

            {/* Hero Balance Card */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-none shadow-md">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Balance</p>
                            <h2 className="text-5xl font-bold tracking-tight">${stats.balance.toLocaleString()}</h2>
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                <span className="text-emerald-500 font-medium">+20.1%</span> from last month
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/dashboard/deposit">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <LucideWallet className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold">Deposit</h3>
                                <p className="text-xs text-muted-foreground">Add funds to your wallet</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/dashboard/payouts">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-primary/20 bg-primary/5">
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <LucideArrowUpRight className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-primary">Send Money</h3>
                                <p className="text-xs text-muted-foreground">Pay beneficiaries or users</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <LucideArrowDownLeft className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold">Get Paid</h3>
                            <p className="text-xs text-muted-foreground">Share your details</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Overview (Mini Cards) */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                        <LucideArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.payoutsCount}</div>
                        <p className="text-xs text-muted-foreground">Processed this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Beneficiaries</CardTitle>
                        <LucideUsers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.beneficiariesCount}</div>
                        <p className="text-xs text-muted-foreground">Verified contacts</p>
                    </CardContent>
                </Card>
            </div>
            {/* Recent Activity Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentPayouts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent transactions.</p>
                        ) : (
                            stats.recentPayouts.map((payout, i) => {
                                const isInternal = payout.type === 'INTERNAL';
                                const receiverId = payout.receiverId?._id || payout.receiverId;
                                const isIncoming = isInternal && receiverId?.toString() === stats.userId?.toString();

                                return (
                                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center space-x-4">
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isIncoming ? 'bg-emerald-100' : 'bg-accent'}`}>
                                                {isIncoming ? (
                                                    <LucideArrowDownLeft className="h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <LucideArrowUpRight className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {isInternal
                                                        ? (isIncoming ? `From: ${payout.sender?.name || 'Unknown'}` : `To: ${payout.receiver?.name || 'Unknown'}`)
                                                        : `To: ${payout.beneficiary?.name || 'Unknown'}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(payout.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${isIncoming ? 'text-emerald-600' : ''}`}>
                                                {isIncoming ? '+' : '-'}{payout.amount} {payout.currency}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {payout.status.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
