"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewWoodTypePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            woodCode: formData.get("woodCode"),
            woodName: formData.get("woodName"),
            avgWasteRate: parseFloat(formData.get("avgWasteRate") as string) / 100,
            isActive: formData.get("isActive") === "on",
        };

        try {
            const res = await fetch("/api/master/wood-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to create wood type");
            }

            router.push("/master/wood-types");
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
                    href="/master/wood-types"
                    className="btn btn-ghost p-2 -ml-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Add Wood Type</h1>
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
                            Wood Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="woodCode"
                            type="text"
                            required
                            className="input"
                            placeholder="e.g. JT"
                            maxLength={10}
                        />
                        <p className="text-xs text-neutral-500">
                            Unique code for log tags (2-10 chars)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Wood Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="woodName"
                            type="text"
                            required
                            className="input"
                            placeholder="e.g. Jati"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Average Waste Rate (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="avgWasteRate"
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
                                Save Wood Type
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
