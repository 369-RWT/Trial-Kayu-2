"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export default function EditWorkerPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [worker, setWorker] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/master/workers/${params.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                setWorker(data.worker);
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
            workerCode: formData.get("workerCode"),
            workerName: formData.get("workerName"),
            phone: formData.get("phone"),
            position: formData.get("position"),
            isActive: formData.get("isActive") === "on",
        };

        try {
            const res = await fetch(`/api/master/workers/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to update worker");
            }

            router.push("/master/workers");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this worker?")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/master/workers/${params.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to delete worker");
            }

            router.push("/master/workers");
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
            setIsDeleting(false);
        }
    }

    if (isLoading) return <div>Loading...</div>;
    if (!worker) return <div>Worker not found</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/master/workers"
                        className="btn btn-ghost p-2 -ml-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Worker</h1>
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
                            Worker Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="workerCode"
                            type="text"
                            required
                            className="input"
                            defaultValue={worker.workerCode}
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
                            defaultValue={worker.workerName}
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
                            defaultValue={worker.phone || ""}
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
                            defaultValue={worker.position || ""}
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
                                defaultChecked={worker.isActive}
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
