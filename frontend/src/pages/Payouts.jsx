
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LucideArrowUpRight, LucideUsers, LucideArrowDownLeft } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Schemas
const beneficiarySchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    currency: z.string().min(3),
    accountNumber: z.string().min(5),
});

const payoutSchema = z.object({
    beneficiaryId: z.string().optional(),
    receiverAccountNumber: z.string().optional(),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be positive"),
    currency: z.string().min(3),
    description: z.string().optional(),
    type: z.enum(['EXTERNAL', 'INTERNAL']),
}).refine(data => {
    if (data.type === 'EXTERNAL' && !data.beneficiaryId) return false;
    if (data.type === 'INTERNAL' && !data.receiverAccountNumber) return false;
    return true;
}, {
    message: "Recipient is required",
    path: ["beneficiaryId"] // visually attach error here
});

export default function PayoutsPage() {
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);

    // Forms
    const benForm = useForm({
        resolver: zodResolver(beneficiarySchema),
        defaultValues: {
            name: '',
            email: '',
            currency: 'USD',
            accountNumber: '',
        },
    });

    const payoutForm = useForm({
        resolver: zodResolver(payoutSchema),
        defaultValues: {
            beneficiaryId: '',
            receiverAccountNumber: '',
            amount: '',
            currency: 'USD',
            description: '',
            type: 'EXTERNAL',
        }
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [benRes, payRes, userRes] = await Promise.all([
                api.get('/payouts/beneficiaries'),
                api.get('/payouts'),
                api.get('/auth/me')
            ]);
            setBeneficiaries(benRes.data);
            setPayouts(payRes.data);
            setUserId(userRes.data.user.id);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onAddBeneficiary = async (values) => {
        try {
            await api.post('/payouts/beneficiaries', {
                name: values.name,
                email: values.email,
                currency: values.currency,
                accountDetails: { accountNumber: values.accountNumber }
            });
            benForm.reset();
            fetchData();
        } catch (error) {
            console.error('Failed to add beneficiary', error);
        }
    };

    const onSendPayout = async (values) => {
        try {
            if (values.type === 'EXTERNAL') {
                await api.post('/payouts', {
                    beneficiaryId: values.beneficiaryId,
                    amount: Number(values.amount),
                    currency: values.currency,
                    description: values.description
                });
            } else {
                await api.post('/internal/transfer', {
                    receiverAccountNumber: values.receiverAccountNumber,
                    amount: Number(values.amount),
                    description: values.description
                });
            }
            payoutForm.reset({
                ...payoutForm.getValues(), // Keep some defaults if needed, or just reset clean
                beneficiaryId: '',
                receiverAccountNumber: '',
                amount: '',
                description: ''
            });
            fetchData();
            alert('Transfer Successful!');
        } catch (error) {
            console.error('Failed to send payout', error);
            alert(error.response?.data?.message || 'Transfer Failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Payouts & Beneficiaries</h1>
            </div>

            <Tabs defaultValue="payouts" className="space-y-4" onValueChange={(value) => {
                if (value === 'internal') {
                    payoutForm.setValue('type', 'INTERNAL');
                    payoutForm.clearErrors();
                } else if (value === 'send') {
                    payoutForm.setValue('type', 'EXTERNAL');
                    payoutForm.clearErrors();
                }
            }}>
                <TabsList>
                    <TabsTrigger value="payouts">Payout History</TabsTrigger>
                    <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
                    <TabsTrigger value="send">External Payout</TabsTrigger>
                    <TabsTrigger value="internal">Internal Transfer</TabsTrigger>
                </TabsList>

                <TabsContent value="payouts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Payouts</CardTitle>
                            <CardDescription>View all your past transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Transaction</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payouts.map((payout) => {
                                        const isInternal = payout.type === 'INTERNAL';
                                        const receiverId = payout.receiverId?._id || payout.receiverId;
                                        const isIncoming = isInternal && receiverId?.toString() === userId?.toString();

                                        return (
                                            <TableRow key={payout._id || payout.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isIncoming ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            {isIncoming ? (
                                                                <LucideArrowDownLeft className="h-4 w-4" />
                                                            ) : (
                                                                <LucideArrowUpRight className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {isInternal
                                                                    ? (isIncoming ? `From: ${payout.sender?.name || 'Unknown'}` : `To: ${payout.receiver?.name || 'Unknown'}`)
                                                                    : `To: ${payout.beneficiary?.name || 'Unknown'}`}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground hidden md:block">
                                                                {isIncoming ? 'Received' : 'Sent'} • ID: {(payout._id || payout.id || "").slice(0, 8)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={`font-medium ${isIncoming ? 'text-emerald-600' : ''}`}>
                                                    {isIncoming ? '+' : '-'}{payout.amount.toLocaleString()} {payout.currency}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={payout.status === 'COMPLETED' ? 'default' : 'secondary'} className={payout.status === 'COMPLETED' ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                                        {payout.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(payout.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {payouts.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payouts found</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="beneficiaries" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="gap-2"><LucideUsers className="h-4 w-4" /> Add Beneficiary</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Beneficiary</DialogTitle>
                                    <DialogDescription>Add a recipient for your payouts.</DialogDescription>
                                </DialogHeader>
                                <Form {...benForm}>
                                    <form onSubmit={benForm.handleSubmit(onAddBeneficiary)} className="space-y-4">
                                        <div className="grid gap-4 py-4">
                                            <FormField control={benForm.control} name="name" render={({ field }) => (
                                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={benForm.control} name="email" render={({ field }) => (
                                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="jane@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={benForm.control} name="currency" render={({ field }) => (
                                                    <FormItem><FormLabel>Currency</FormLabel><FormControl><Input placeholder="USD" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={benForm.control} name="accountNumber" render={({ field }) => (
                                                    <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Starts with..." {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Save Beneficiary</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <CardHeader><CardTitle>Beneficiaries</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Details</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {beneficiaries.map((ben) => (
                                        <TableRow key={ben.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {ben.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="font-medium">{ben.name}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{ben.email}</div>
                                                <div className="text-xs text-muted-foreground">{ben.currency}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {beneficiaries.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No beneficiaries found</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="send" className="space-y-4 max-w-xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Payout</CardTitle>
                            <CardDescription>Initiate a new transfer to a beneficiary.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...payoutForm}>
                                <form onSubmit={payoutForm.handleSubmit((data) => onSendPayout({ ...data, type: 'EXTERNAL' }))} className="space-y-4">
                                    <FormField control={payoutForm.control} name="beneficiaryId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Beneficiary</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a beneficiary" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {beneficiaries.map((ben) => (
                                                        <SelectItem key={ben.id} value={ben.id}>{ben.name} ({ben.currency})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={payoutForm.control} name="amount" render={({ field }) => (
                                        <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={payoutForm.control} name="currency" render={({ field }) => (
                                        <FormItem><FormLabel>Currency</FormLabel><FormControl><Input placeholder="USD" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={payoutForm.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Input placeholder="Payment for service" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <Button type="submit" className="w-full">Initiate Payout</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="internal" className="space-y-4 max-w-xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Internal Transfer</CardTitle>
                            <CardDescription>Send money instantly to another bepay user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...payoutForm}>
                                <form onSubmit={payoutForm.handleSubmit((data) => onSendPayout({ ...data, type: 'INTERNAL' }))} className="space-y-4">
                                    <FormField control={payoutForm.control} name="receiverAccountNumber" render={({ field }) => (
                                        <FormItem><FormLabel>Receiver Account Number</FormLabel><FormControl><Input placeholder="Enter Account Number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={payoutForm.control} name="amount" render={({ field }) => (
                                        <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={payoutForm.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Input placeholder="Internal Transfer" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <Button type="submit" className="w-full">Send Instantly</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
