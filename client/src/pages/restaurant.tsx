import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, Clock, Star, Plus, Utensils } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { MenuCategory, MenuItemWithCategory, RestaurantOrder } from "@/lib/types";

export default function Restaurant() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ["/api/menu-categories", user?.branchId],
    enabled: !!user,
  });

  const { data: menuItems = [], isLoading: itemsLoading } = useQuery<MenuItemWithCategory[]>({
    queryKey: ["/api/menu-items", user?.branchId],
    enabled: !!user,
  });

  const { data: orders = [] } = useQuery<RestaurantOrder[]>({
    queryKey: ["/api/restaurant-orders", user?.branchId],
    enabled: !!user,
  });

  // Calculate stats
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const pendingOrders = orders.filter(order => order.status === "pending" || order.status === "preparing");

  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.categoryId === selectedCategory)
    : menuItems;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      served: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (categoriesLoading || itemsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Restaurant</h2>
        <div className="flex space-x-3">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
          {(user?.role === "super_admin" || user?.role === "branch_admin") && (
            <Button variant="outline">
              <Utensils className="h-4 w-4 mr-2" />
              Manage Menu
            </Button>
          )}
        </div>
      </div>

      {/* Restaurant Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{todayOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${todayRevenue.toFixed(2)}</p>
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
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                <p className="text-2xl font-semibold text-gray-900">4.8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map((category) => {
                const itemCount = menuItems.filter(item => item.categoryId === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category.name} ({itemCount})
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name || "Menu Items"
                  : "All Menu Items"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No menu items found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                        <span className="text-lg font-bold text-gray-900">${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                        {item.preparationTime && (
                          <span>⏱️ {item.preparationTime} min</span>
                        )}
                        <Badge variant={item.available ? "default" : "secondary"}>
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="text-xs text-gray-500 mb-3">
                          <span className="font-medium">Ingredients:</span> {item.ingredients.join(", ")}
                        </div>
                      )}
                      
                      <Button size="sm" className="w-full" disabled={!item.available}>
                        Add to Order
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Order #{order.orderNumber}</div>
                    <div className="text-sm text-gray-500 capitalize">{order.orderType.replace('_', ' ')}</div>
                    {order.roomId && (
                      <div className="text-sm text-gray-500">Room Service</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${parseFloat(order.total).toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
