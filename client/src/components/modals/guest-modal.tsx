import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Guest } from "@shared/schema";

const guestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  idNumber: z.string().optional(),
  idType: z.enum(["passport", "driver_license", "national_id"]).optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest?: Guest | null;
}

export default function GuestModal({ isOpen, onClose, guest }: GuestModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  });

  const createGuestMutation = useMutation({
    mutationFn: (data: GuestFormData) =>
      apiRequest("POST", "/api/guests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      onClose();
      form.reset();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create guest");
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: (data: Partial<GuestFormData>) =>
      apiRequest("PUT", `/api/guests/${guest?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to update guest");
    },
  });

  useEffect(() => {
    if (guest) {
      form.setValue("firstName", guest.firstName);
      form.setValue("lastName", guest.lastName);
      form.setValue("email", guest.email);
      form.setValue("phone", guest.phone);
      form.setValue("address", guest.address || "");
      form.setValue("idNumber", guest.idNumber || "");
      form.setValue("idType", guest.idType as any || undefined);
      form.setValue("dateOfBirth", guest.dateOfBirth ? new Date(guest.dateOfBirth).toISOString().split('T')[0] : "");
      form.setValue("nationality", guest.nationality || "");
    } else {
      form.reset();
    }
    setError("");
  }, [guest, form]);

  const handleSubmit = async (data: GuestFormData) => {
    try {
      const submitData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
      };

      if (guest) {
        await updateGuestMutation.mutateAsync(submitData);
      } else {
        await createGuestMutation.mutateAsync(submitData);
      }
    } catch (err) {
      // Error handled in mutation
    }
  };

  const getGuestStatus = (guest: Guest) => {
    if (guest.totalStays === 0) return "New";
    if (guest.totalStays > 5) return "VIP";
    return "Regular";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "New": "bg-blue-100 text-blue-800",
      "Regular": "bg-green-100 text-green-800",
      "VIP": "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{guest ? "Guest Details" : "Add New Guest"}</span>
            {guest && (
              <div className="flex items-center space-x-2">
                {getStatusBadge(getGuestStatus(guest))}
                <Badge variant="outline">
                  {guest.totalStays} stays
                </Badge>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                {...form.register("firstName")}
                placeholder="John"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                {...form.register("lastName")}
                placeholder="Smith"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                {...form.register("email")}
                placeholder="john@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                {...form.register("phone")}
                placeholder="+1 234 567 8900"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                type="date"
                {...form.register("dateOfBirth")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                {...form.register("nationality")}
                placeholder="US, UK, Canada, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idType">ID Type</Label>
              <Select
                value={form.watch("idType") || ""}
                onValueChange={(value) => form.setValue("idType", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driver_license">Driver's License</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                {...form.register("idNumber")}
                placeholder="ID number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              {...form.register("address")}
              placeholder="Complete address..."
              rows={3}
            />
          </div>

          {guest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Guest Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{guest.totalStays}</div>
                  <div className="text-gray-500">Total Stays</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getGuestStatus(guest)}</div>
                  <div className="text-gray-500">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(guest.createdAt).getFullYear()}
                  </div>
                  <div className="text-gray-500">Member Since</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {guest.dateOfBirth 
                      ? Math.floor((new Date().getTime() - new Date(guest.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
                      : 'N/A'
                    }
                  </div>
                  <div className="text-gray-500">Age</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createGuestMutation.isPending || updateGuestMutation.isPending}
            >
              {createGuestMutation.isPending || updateGuestMutation.isPending 
                ? (guest ? "Updating..." : "Creating...") 
                : (guest ? "Update Guest" : "Create Guest")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
