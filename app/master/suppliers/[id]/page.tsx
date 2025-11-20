"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export default function EditSupplierPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [supplier, setSupplier] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/master/suppliers/${params.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                setSupplier(data.supplier);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [params.id]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            supplierCode: formData.get("supplierCode"),
            supplierName: formData.get("supplierName"),
            contactPerson: formData.get("contactPerson"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            paymentTerms: formData.get("paymentTerms"),
            isActive: formData.get("isActive") === "on",
        };

        try {
            const res = await fetch(`/api/master/suppliers/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to update supplier");
            }

            router.push("/master/suppliers");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this supplier?")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/master/suppliers/${params.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to delete supplier");
            }

            router.push("/master/suppliers");
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
            setIsDeleting(false);
        }
    }

    if (isLoading) return <div>Loading...</div>;
    if (!supplier) return <div>Supplier not found</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/master/suppliers"
                        className="btn btn-ghost p-2 -ml-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Supplier</h1>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="btn btn-danger"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </button>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Supplier Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="supplierCode"
                            type="text"
                            required
                            className="input"
                            defaultValue={supplier.supplierCode}
                            maxLength={20}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Supplier Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="supplierName"
                            type="text"
                            required
                            className="input"
                            defaultValue={supplier.supplierName}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Contact Person
                        </label>
                        <input
                            name="contactPerson"
                            type="text"
                            className="input"
                            defaultValue={supplier.contactPerson || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Phone
                        </label>
                        <input
                            name="phone"
                            type="tel"
                            className="input"
                            defaultValue={supplier.phone || ""}
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Address
                        </label>
                        <textarea
                            name="address"
                            className="input min-h-[80px]"
                            defaultValue={supplier.address || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Payment Terms
                        </label>
                        <input
                            name="paymentTerms"
                            type="text"
                            className="input"
                            defaultValue={supplier.paymentTerms || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Status
                        </label>
                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                name="isActive"
                                type="checkbox"
                                defaultChecked={supplier.isActive}
                                className="h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-600">Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary"
                    >
                        {isSubmitting ? (
                            "Saving..."
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
