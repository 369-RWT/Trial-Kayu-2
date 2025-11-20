"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewWorkerPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            workerCode: formData.get("workerCode"),
            workerName: formData.get("workerName"),
            phone: formData.get("phone"),
            position: formData.get("position"),
            isActive: formData.get("isActive") === "on",
        };

        try {
            const res = await fetch("/api/master/workers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to create worker");
            }

            router.push("/master/workers");
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
                    href="/master/workers"
                    className="btn btn-ghost p-2 -ml-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Add Worker</h1>
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
                            Worker Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="workerCode"
                            type="text"
                            required
                            className="input"
                            placeholder="e.g. W001"
                            maxLength={20}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Worker Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="workerName"
                            type="text"
                            required
                            className="input"
                            placeholder="e.g. Ahmad"
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
                            placeholder="e.g. 08123456789"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">
                            Position
                        </label>
                        <input
                            name="position"
                            type="text"
                            className="input"
                            placeholder="e.g. Operator"
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
                                Save Worker
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
