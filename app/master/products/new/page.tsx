"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [machineTypes, setMachineTypes] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/master/machine-types")
            .then((res) => res.json())
            .then((data) => setMachineTypes(data.machineTypes || []))
            .catch(console.error);
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            productCode: formData.get("productCode"),
            productName: formData.get("productName"),
            machineTypeId: parseInt(formData.get("machineTypeId") as string),
            standardWasteRate: parseFloat(formData.get("standardWasteRate") as string) / 100,
            isActive: formData.get("isActive") === "on",
        };

        try {
            const res = await fetch("/api/master/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to create product");
            }

            router.push("/master/products");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/master/products"
                    className="btn btn-ghost p-2 -ml-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
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
                            Product Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="productCode"
                            type="text"
                            required
                            className="input"
                            placeholder="e.g. P001"
                            maxLength={20}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="productName"
                            type="text"
                            required
                            className="input"
                            placeholder="e.g. Flooring"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Machine Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="machineTypeId"
                            required
                            className="input"
                        >
                            <option value="">Select Machine Type</option>
                            {machineTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.machineName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Standard Waste Rate (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="standardWasteRate"
                            type="number"
                            required
                            min="0"
                            max="100"
                            step="0.01"
                            className="input"
                            defaultValue="0"
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
                                defaultChecked
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
                                Save Product
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
