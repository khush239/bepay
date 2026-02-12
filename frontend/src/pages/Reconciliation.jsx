
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideDownload, LucideArrowUpRight, LucideArrowDownLeft } from 'lucide-react';

export default function ReconciliationPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/payouts/reconciliation');
            setTransactions(res.data);
        } catch (error) {
            console.error('Failed to fetch reconciliation data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/payouts/reconciliation/export', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reconciliation_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            alert('Failed to export CSV');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reconciliation</h1>
                    <p className="text-muted-foreground">View and export your complete transaction history.</p>
                </div>
                <Button onClick={handleExport} className="gap-2">
                    <LucideDownload className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction Ledger</CardTitle>
                    <CardDescription>All incoming and outgoing transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Counterparty</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
                                    <TableRow key={tx._id || tx.id}>
                                        <TableCell>{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</TableCell>
                                        <TableCell className="font-mono text-xs">{(tx._id || tx.id || "").slice(0, 8)}...</TableCell>
                                        <TableCell>
                                            <Badge variant={tx.type === 'CREDIT' ? 'default' : 'secondary'} className={tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                                                {tx.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{tx.category}</TableCell>
                                        <TableCell>{tx.counterparty || 'Unknown'}</TableCell>
                                        <TableCell className={`font-mono font-medium ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount} {tx.currency}
                                        </TableCell>
                                        <TableCell>{tx.status}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
