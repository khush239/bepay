
import { useState, useEffect } from 'react';
import { LucideSearch, LucidePlus, LucideMoreHorizontal, LucideWallet, LucideMail, LucideBuilding2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Schema (Reused)
const beneficiarySchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    currency: z.string().min(3),
    accountNumber: z.string().min(5),
});

// Add payout schema
const payoutSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be positive"),
    description: z.string().optional(),
});

export default function BeneficiariesPage() {
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null); // For payout modal

    // Add Beneficiary Form
    const form = useForm({
        resolver: zodResolver(beneficiarySchema),
        defaultValues: {
            name: '',
            email: '',
            currency: 'USD',
            accountNumber: '',
        },
    });

    // Payout Form
    const payoutForm = useForm({
        resolver: zodResolver(payoutSchema),
        defaultValues: {
            amount: '',
            description: '',
        }
    });

    const fetchBeneficiaries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payouts/beneficiaries');
            setBeneficiaries(res.data);
        } catch (error) {
            console.error('Failed to fetch beneficiaries', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBeneficiaries();
    }, []);

    const onAddBeneficiary = async (values) => {
        try {
            await api.post('/payouts/beneficiaries', {
                name: values.name,
                email: values.email,
                currency: values.currency,
                accountDetails: { accountNumber: values.accountNumber }
            });
            form.reset();
            fetchBeneficiaries();
            alert('Beneficiary Added');
        } catch (error) {
            console.error('Failed to add beneficiary', error);
        }
    };

    const onSendPayout = async (values) => {
        if (!selectedBeneficiary) return;
        try {
            await api.post('/payouts', {
                beneficiaryId: selectedBeneficiary._id || selectedBeneficiary.id,
                amount: Number(values.amount),
                currency: selectedBeneficiary.currency,
                description: values.description
            });
            alert('Transfer Successful!');
            setSelectedBeneficiary(null); // Close modal
            payoutForm.reset();
        } catch (error) {
            console.error('Failed to send payout', error);
            alert(error.response?.data?.message || 'Transfer Failed');
        }
    };

    const filteredBeneficiaries = beneficiaries.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Beneficiaries</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <LucideSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email"
                            className="pl-8 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                <LucidePlus className="h-4 w-4" /> Add Beneficiary
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Beneficiary</DialogTitle>
                                <DialogDescription>Enter beneficiary details below.</DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onAddBeneficiary)} className="space-y-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="jane@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="currency" render={({ field }) => (
                                            <FormItem><FormLabel>Currency</FormLabel><FormControl><Input placeholder="USD" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="accountNumber" render={({ field }) => (
                                            <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Account No." {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <Button type="submit" className="w-full">Save Beneficiary</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-gray-100">
                                <TableHead className="w-[300px] text-xs font-medium text-muted-foreground uppercase tracking-wider pl-6">Name</TableHead>
                                <TableHead className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Pay via</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBeneficiaries.map((ben) => (
                                <TableRow key={ben._id || ben.id} className="hover:bg-gray-50/50 border-b border-gray-50">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 bg-blue-50 text-blue-600 border border-blue-100 hidden md:flex">
                                                <AvatarFallback className="text-xs font-semibold">
                                                    {ben.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{ben.name}</span>
                                                <span className="text-xs text-muted-foreground">{ben.currency}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200"
                                                title="Pay via Bank Transfer"
                                                onClick={() => setSelectedBeneficiary(ben)}
                                            >
                                                <LucideBuilding2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredBeneficiaries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                        No beneficiaries found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Payout Modal */}
            <Dialog open={!!selectedBeneficiary} onOpenChange={(open) => !open && setSelectedBeneficiary(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Money to {selectedBeneficiary?.name}</DialogTitle>
                        <DialogDescription>
                            Initiate a transfer to {selectedBeneficiary?.accountDetails ? 'Bank Account' : 'Email'}.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...payoutForm}>
                        <form onSubmit={payoutForm.handleSubmit(onSendPayout)} className="space-y-4">
                            <FormField control={payoutForm.control} name="amount" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount ({selectedBeneficiary?.currency})</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={payoutForm.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Payment for services" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full">
                                Confirm Transfer
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
