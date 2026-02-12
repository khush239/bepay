import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LucideWallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const depositSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be positive"),
});

export default function DepositPage() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(depositSchema),
        defaultValues: {
            amount: '',
        },
    });

    const onSubmit = async (values) => {
        setLoading(true);
        try {
            await api.post('/internal/deposit', {
                amount: Number(values.amount)
            });
            alert('Deposit Successful!');
            navigate('/dashboard'); // Redirect to dashboard to see balance
        } catch (error) {
            console.error('Deposit failed', error);
            alert(error.response?.data?.message || 'Deposit Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6 mt-10">
            <h1 className="text-3xl font-bold tracking-tight text-center">Add Funds</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LucideWallet className="h-5 w-5 text-blue-600" />
                        Deposit Money
                    </CardTitle>
                    <CardDescription>Add funds to your wallet instantly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (USD)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                                <Input className="pl-7" placeholder="100.00" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Processing...' : 'Deposit Funds'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
