"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewMachinePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            machineName: formData.get("machineName"),
            description: formData.get("description"),
            isActive: formData.get("isActive") === "on",
        };

        try {
            const res = await fetch("/api/master/machine-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to create machine type");
            }

            router.push("/master/machines");
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
                    href="/master/machines"
                    className="btn btn-ghost p-2 -ml-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Add Machine Type</h1>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-900">
                        Machine Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="machineName"
                        type="text"
                        required
                        className="input"
                        placeholder="e.g. Saw Machine"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-900">
                        Description
                    </label>
                    <textarea
                        name="description"
                        className="input min-h-[80px]"
                        placeholder="Machine description..."
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
                                Save Machine Type
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
