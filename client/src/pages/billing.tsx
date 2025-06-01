import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Receipt, Clock, AlertTriangle, Plus, Download, Eye } from "lucide-react";
import type { InvoiceWithGuest } from "@/lib/types";

export default function Billing() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices = [], isLoading } = useQuery<InvoiceWithGuest[]>({
    queryKey: ["/api/invoices", user?.branchId],
    enabled: !!user,
  });

  // Calculate stats
  const totalRevenue = invoices
    .filter(invoice => invoice.status === "paid")
    .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);

  const paidInvoices = invoices.filter(invoice => invoice.status === "paid");
  const pendingInvoices = invoices.filter(invoice => invoice.status === "pending");
  const overdueInvoices = invoices.filter(invoice => {
    if (invoice.status !== "pending") return false;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    return dueDate < today;
  });

  const filteredInvoices = statusFilter === "all" 
    ? invoices 
    : invoices.filter(invoice => invoice.status === statusFilter);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const isOverdue = (invoice: InvoiceWithGuest) => {
    if (invoice.status !== "pending") return false;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    return dueDate < today;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Invoices</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Paid Invoices</p>
                <p className="text-2xl font-semibold text-gray-900">{paidInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900">{overdueInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === "all" ? "All Invoices" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Invoices`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        {invoice.guest ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {invoice.guest.firstName} {invoice.guest.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{invoice.guest.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Guest not found</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">${parseFloat(invoice.total).toFixed(2)}</TableCell>
                      <TableCell>
                        {getStatusBadge(isOverdue(invoice) ? "overdue" : invoice.status)}
                      </TableCell>
                      <TableCell>
                        <div className={isOverdue(invoice) ? "text-red-600 font-medium" : ""}>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          {invoice.status === "pending" && (
                            <Button size="sm">
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      {filteredInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredInvoices.length}
                </div>
                <div className="text-sm text-gray-500">Total Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${filteredInvoices
                    .filter(inv => inv.status === "paid")
                    .reduce((sum, inv) => sum + parseFloat(inv.total), 0)
                    .toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  ${filteredInvoices
                    .filter(inv => inv.status === "pending")
                    .reduce((sum, inv) => sum + parseFloat(inv.total), 0)
                    .toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total Outstanding</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
