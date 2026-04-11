"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, UserCircleIcon, MapPinIcon, CreditCardIcon, ShoppingBagIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        const response = await fetch(`/api/v1/admin/customers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch customer details");
        }

        setCustomer(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong fetching customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, router]);

  const handleEditClick = () => {
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      gender: customer.gender || "",
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : "",
    });
    setIsEditing(true);
  };

  const handleSaveCustomer = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/v1/admin/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone || null,
          gender: editForm.gender || null,
          dateOfBirth: editForm.dateOfBirth || null,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update customer");

      setCustomer((prev: any) => ({
        ...prev,
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone,
        gender: data.data.gender,
        dateOfBirth: data.data.dateOfBirth,
      }));
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to permanently delete this address?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/v1/admin/customers/${id}/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
         const data = await response.json();
         throw new Error(data.message || "Failed to delete address");
      }

      setCustomer((prev: any) => ({
        ...prev,
        addresses: prev.addresses.filter((a: any) => a.id !== addressId)
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md inline-block">
          {error || "Customer not found"}
        </div>
        <div className="mt-4">
          <button onClick={() => router.back()} className="text-asc-matte hover:underline flex items-center">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-asc-sand-muted text-asc-charcoal transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-asc-matte flex items-center">
            {customer.name}
            <span className={`ml-3 text-xs px-2 py-1 rounded-full font-medium ${customer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
               {customer.isActive ? "Active" : "Inactive"}
            </span>
          </h1>
          <p className="mt-1 text-sm text-asc-charcoal flex items-center">
             Customer since {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Identity & Contact */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col space-y-4 border border-asc-border relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-asc-border pb-2">
            <div className="flex items-center text-asc-matte font-semibold text-lg">
              <UserCircleIcon className="h-6 w-6 mr-2 text-asc-accent" />
              Identity & Contact
            </div>
            <button onClick={handleEditClick} className="text-asc-accent hover:text-asc-matte transition-colors" title="Edit Customer Identity">
              <PencilSquareIcon className="h-5 w-5" />
            </button>
          </div>
          <div>
            <label className="text-xs text-asc-charcoal-muted uppercase">Email</label>
            <p className="text-sm font-medium text-asc-matte">{customer.email}</p>
          </div>
          <div>
            <label className="text-xs text-asc-charcoal-muted uppercase">Phone</label>
            <p className="text-sm font-medium text-asc-matte">{customer.phone || "Not provided"}</p>
          </div>
          <div>
            <label className="text-xs text-asc-charcoal-muted uppercase">Gender</label>
            <p className="text-sm font-medium text-asc-matte">{customer.gender || "Not provided"}</p>
          </div>
          <div>
            <label className="text-xs text-asc-charcoal-muted uppercase">Date of Birth</label>
            <p className="text-sm font-medium text-asc-matte">{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : "Not provided"}</p>
          </div>
          <div>
            <label className="text-xs text-asc-charcoal-muted uppercase">Last Login</label>
            <p className="text-sm font-medium text-asc-matte">{customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleString() : "Never"}</p>
          </div>
        </div>

        {/* Column 2: Addresses */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col space-y-4 border border-asc-border">
          <div className="flex items-center text-asc-matte font-semibold text-lg border-b border-asc-border pb-2">
            <MapPinIcon className="h-6 w-6 mr-2 text-asc-accent" />
            Saved Addresses
          </div>
          {customer.addresses && customer.addresses.length > 0 ? (
            <div className="space-y-4">
              {customer.addresses.map((addr: any) => (
                <div key={addr.id} className="bg-asc-sand-muted p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-xs font-bold text-asc-matte uppercase">{addr.type}</span>
                      {addr.isDefault && <span className="ml-2 text-[10px] bg-asc-matte text-white px-2 py-0.5 rounded">Default</span>}
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-700" title="Delete Address">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-asc-matte">{addr.name}</p>
                  <p className="text-xs text-asc-charcoal">{addr.line1} {addr.line2}</p>
                  <p className="text-xs text-asc-charcoal">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-xs text-asc-charcoal">{addr.country}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-asc-charcoal">No addresses saved.</p>
          )}
        </div>

        {/* Column 3: Payment Methods */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col space-y-4 border border-asc-border">
          <div className="flex items-center text-asc-matte font-semibold text-lg border-b border-asc-border pb-2">
            <CreditCardIcon className="h-6 w-6 mr-2 text-asc-accent" />
            Payment Methods
          </div>
          <p className="text-[10px] text-asc-charcoal-muted leading-tight mb-2">
            Note: For strict security and compliance, full billing information is never stored or displayed. Only tokenized vault data is retrieved.
          </p>
          {customer.paymentMethods && customer.paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {customer.paymentMethods.map((pm: any) => (
                <div key={pm.id} className="bg-asc-sand-muted p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-asc-matte capitalize flex items-center">
                       {pm.brand || pm.provider} 
                       {pm.isDefault && <span className="ml-2 text-[10px] bg-asc-matte text-white px-2 py-0.5 rounded">Default</span>}
                    </p>
                    {pm.last4 && <p className="text-xs text-asc-charcoal font-mono mt-1">**** **** **** {pm.last4}</p>}
                    {pm.expiryMonth && pm.expiryYear && <p className="text-xs text-asc-charcoal mt-1">Exp: {pm.expiryMonth}/{pm.expiryYear}</p>}
                  </div>
                  <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-[10px] text-asc-charcoal font-bold border border-asc-border">
                    {pm.type}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-asc-charcoal">No payment methods linked.</p>
          )}
        </div>

      </div>

      {/* Full Width Order History */}
      <div className="mt-8 bg-white shadow rounded-lg border border-asc-border overflow-hidden">
        <div className="p-6 border-b border-asc-border flex items-center text-asc-matte font-semibold text-lg">
          <ShoppingBagIcon className="h-6 w-6 mr-2 text-asc-accent" />
          Order History
        </div>
        <div className="overflow-x-auto">
          {customer.orders && customer.orders.length > 0 ? (
             <table className="min-w-full divide-y divide-asc-border">
               <thead className="bg-asc-sand-muted">
                 <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Total</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-asc-border">
                 {customer.orders.map((order: any) => (
                   <tr key={order.id} className="hover:bg-asc-sand-muted transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-asc-matte">{order.orderNumber}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">{new Date(order.createdAt).toLocaleDateString()}</td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "DELIVERED" ? "bg-green-100 text-green-800"
                          : order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" 
                          : order.status === "CANCELLED" ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                       }`}>
                         {order.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-asc-matte">₹{order.total.toLocaleString()}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          ) : (
            <div className="p-8 text-center text-asc-charcoal text-sm">
              This customer has not placed any orders yet.
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-asc-charcoal/50 backdrop-blur-sm" onClick={() => !saving && setIsEditing(false)}></div>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="px-6 py-4 border-b border-asc-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-asc-matte">Edit Customer Identity</h3>
            </div>
            <div className="p-6 space-y-4 text-asc-charcoal text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Full Name</label>
                <input 
                  type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Email Address</label>
                <input 
                  type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Phone Number</label>
                <input 
                  type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Gender</label>
                  <select 
                    value={editForm.gender} onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                    className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte bg-white"
                  >
                    <option value="">Unspecified</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Date of Birth</label>
                  <input 
                    type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                    className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="bg-asc-canvas px-6 py-4 flex justify-end gap-3 border-t border-asc-border">
              <button 
                onClick={() => setIsEditing(false)} disabled={saving}
                className="px-4 py-2 border border-asc-border font-medium text-asc-charcoal rounded-md hover:bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCustomer} disabled={saving}
                className="px-4 py-2 bg-asc-matte text-white font-medium rounded-md hover:bg-black transition-colors min-w-[100px] flex justify-center items-center"
              >
                {saving ? <div className="h-5 w-5 rounded-full border-t-2 border-white animate-spin"></div> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
