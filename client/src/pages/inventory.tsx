import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { hasRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Package, AlertTriangle, TrendingDown, Plus } from "lucide-react";
import type { InventoryItem } from "@shared/schema";

export default function Inventory() {
  const { user } = useAuth();

  if (!hasRole(user, ["super_admin", "branch_admin"])) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view inventory.</p>
        </div>
      </div>
    );
  }

  const { data: inventoryItems = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory-items", user?.branchId],
    enabled: !!user,
  });

  // Calculate stats
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock);
  const outOfStockItems = inventoryItems.filter(item => item.currentStock === 0);
  const totalValue = inventoryItems.reduce((sum, item) => {
    const cost = item.costPerUnit ? parseFloat(item.costPerUnit) : 0;
    return sum + (cost * item.currentStock);
  }, 0);

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return "out-of-stock";
    if (item.currentStock <= item.minStock) return "low-stock";
    if (item.currentStock >= item.maxStock * 0.8) return "well-stocked";
    return "normal";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "out-of-stock": "bg-red-100 text-red-800",
      "low-stock": "bg-yellow-100 text-yellow-800",
      "normal": "bg-green-100 text-green-800",
      "well-stocked": "bg-blue-100 text-blue-800",
    };

    const labels: Record<string, string> = {
      "out-of-stock": "Out of Stock",
      "low-stock": "Low Stock",
      "normal": "Normal",
      "well-stocked": "Well Stocked",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getStockPercentage = (item: InventoryItem) => {
    if (item.maxStock === 0) return 0;
    return Math.min((item.currentStock / item.maxStock) * 100, 100);
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
        <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{inventoryItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{outOfStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      Current: {item.currentStock} {item.unit} | Min: {item.minStock} {item.unit}
                    </div>
                  </div>
                  <Button size="sm">Restock</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  inventoryItems.map((item) => {
                    const status = getStockStatus(item);
                    const percentage = getStockPercentage(item);
                    const totalValue = item.costPerUnit ? parseFloat(item.costPerUnit) * item.currentStock : 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {item.currentStock} {item.unit}
                          </div>
                          <div className="text-sm text-gray-500">
                            Max: {item.maxStock} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-20">
                            <Progress value={percentage} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              {percentage.toFixed(0)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                        <TableCell>
                          {item.costPerUnit ? `$${parseFloat(item.costPerUnit).toFixed(2)}` : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${totalValue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {item.lastRestocked 
                            ? new Date(item.lastRestocked).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button size="sm">
                              Restock
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
