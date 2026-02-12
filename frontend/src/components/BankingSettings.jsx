import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Copy, Check, Edit2, Building2, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const bankingSchema = z.object({
    accountNumber: z.string().min(5, "Account Number must be at least 5 digits"),
    bankName: z.string().min(2, "Bank Name is required"),
});

export default function BankingSettings({ user, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(null);

    const form = useForm({
        resolver: zodResolver(bankingSchema),
        defaultValues: {
            accountNumber: user?.accountNumber || '',
            bankName: user?.bankName || '',
        }
    });

    useEffect(() => {
        if (user) {
            form.reset({
                accountNumber: user.accountNumber || '',
                bankName: user.bankName || '',
            });
        }
    }, [user, form]);

    const onSubmit = async (values) => {
        setLoading(true);
        try {
            await api.put('/internal/banking', values);
            onUpdate();
            setIsEditing(false);
            // alert('Banking details updated!'); // Removed alert for smoother UX
        } catch (error) {
            console.error('Update failed', error);
            alert(error.response?.data?.message || 'Update Failed');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    if (user?.accountNumber && !isEditing) {
        return (
            <Card className="bg-gradient-to-br from-white to-gray-50 border-input shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-xl text-primary">Virtual Account Details</CardTitle>
                        <CardDescription>Use these details to receive transfers.</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    {/* Account Holder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Beneficiary Name</label>
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                                <span className="font-medium">{user.name}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(user.name, 'name')}>
                                    {copied === 'name' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                        </div>

                        {/* Bank Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bank Name</label>
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                                <div className="flex items-center space-x-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{user.bankName}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(user.bankName, 'bank')}>
                                    {copied === 'bank' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                        </div>

                        {/* Account Number */}
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Number</label>
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-lg font-semibold tracking-wide">{user.accountNumber}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(user.accountNumber, 'account')}>
                                    {copied === 'account' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 flex justify-end">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Details
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? 'Edit Banking Details' : 'Setup Banking Information'}</CardTitle>
                <CardDescription>Enter your account details to start receiving funds.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="accountNumber" render={({ field }) => (
                            <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="e.g. 1234567890" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="bankName" render={({ field }) => (
                            <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g. Chase Bank" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="flex justify-end space-x-2">
                            {isEditing && (
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            )}
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Details'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
