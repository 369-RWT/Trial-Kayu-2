"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export default function EditPricingPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [pricing, setPricing] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [woodTypes, setWoodTypes] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            fetch(`/api/master/pricing/${params.id}`).then((res) => res.json()),
            fetch("/api/master/products").then((res) => res.json()),
            fetch("/api/master/wood-types").then((res) => res.json()),
        ])
            .then(([pricingData, productsData, woodTypesData]) => {
                if (pricingData.error) throw new Error(pricingData.error);
                setPricing(pricingData.pricing);
                setProducts(productsData.products || []);
                setWoodTypes(woodTypesData.woodTypes || []);
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
            productId: parseInt(formData.get("productId") as string),
            woodTypeId: parseInt(formData.get("woodTypeId") as string),
            sellingPricePerKubik: parseFloat(formData.get("sellingPricePerKubik") as string),
            effectiveDate: formData.get("effectiveDate"),
            isActive: formData.get("isActive") === "on",
        };

        try {
            const res = await fetch(`/api/master/pricing/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to update pricing");
            }

            router.push("/master/pricing");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this pricing?")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/master/pricing/${params.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to delete pricing");
            }

            router.push("/master/pricing");
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
            setIsDeleting(false);
        }
    }

    if (isLoading) return <div>Loading...</div>;
    if (!pricing) return <div>Pricing not found</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/master/pricing"
                        className="btn btn-ghost p-2 -ml-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Pricing</h1>
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
                            Product <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="productId"
                            required
                            className="input"
                            defaultValue={pricing.productId}
                        >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.productName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Wood Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="woodTypeId"
                            required
                            className="input"
                            defaultValue={pricing.woodTypeId}
                        >
                            <option value="">Select Wood Type</option>
                            {woodTypes.map((wood) => (
                                <option key={wood.id} value={wood.id}>
                                    {wood.woodName} ({wood.woodCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Price per Kubik (Rp) <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="sellingPricePerKubik"
                            type="number"
                            required
                            min="0"
                            className="input"
                            defaultValue={pricing.sellingPricePerKubik}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Effective Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="effectiveDate"
                            type="date"
                            required
                            className="input"
                            defaultValue={new Date(pricing.effectiveDate).toISOString().split("T")[0]}
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
                                defaultChecked={pricing.isActive}
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
