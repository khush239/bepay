
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import BankingSettings from '@/components/BankingSettings';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
    const [org, setOrg] = useState(null);
    const [user, setUser] = useState(null);

    const fetchOrg = async () => {
        try {
            const res = await api.get('/organizations');
            setOrg(res.data);
            // Also fetch user profile 
            // const userRes = await api.get('/auth/me'); 
        } catch (error) {
            console.error('Failed to fetch org', error);
        }
    };

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
        } catch (e) { }
    }

    useEffect(() => {
        fetchOrg();
        fetchUser();
    }, []);

    const handleKycSubmit = async () => {
        try {
            await api.post('/organizations/kyc', { documentType: 'PASSPORT', documentNumber: '123456789' });
            fetchOrg();
            alert('KYC Submitted and Verified (Sandbox Mode)');
        } catch (error) {
            console.error('KYC error', error);
        }
    };

    if (!org) return <div>Loading...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Organization Profile</CardTitle>
                    <CardDescription>Manage your business details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <div className="font-semibold">Organization Name</div>
                        <div>{org.name}</div>
                    </div>
                    <div className="grid gap-2">
                        <div className="font-semibold">KYC Status</div>
                        <div>
                            <Badge variant={org.kycStatus === 'VERIFIED' ? 'default' : 'destructive'}>
                                {org.kycStatus}
                            </Badge>
                        </div>
                    </div>
                    {org.kycStatus !== 'VERIFIED' && (
                        <Button onClick={handleKycSubmit}>Submit KYC Documents</Button>
                    )}
                </CardContent>
            </Card>

            <BankingSettings user={user} onUpdate={fetchUser} />
        </div>
    );
}
