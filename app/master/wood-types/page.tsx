import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getWoodTypes() {
    const woodTypes = await prisma.woodType.findMany({
        orderBy: {
            woodCode: "asc",
        },
    });

    return woodTypes;
}

export default async function WoodTypesPage() {
    const woodTypes = await getWoodTypes();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Wood Types</h1>
                    <p className="text-neutral-600 mt-1">
                        {woodTypes.length} wood types configured
                    </p>
                </div>
                <Link href="/master/wood-types/new" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Wood Type
                </Link>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Avg Waste Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {woodTypes.map((woodType) => (
                            <tr key={woodType.id} className="hover:bg-neutral-50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        href={`/master/wood-types/${woodType.id}`}
                                        className="font-mono font-semibold text-sm text-primary-600 hover:text-primary-800"
                                    >
                                        {woodType.woodCode}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-neutral-900">
                                        {woodType.woodName}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-neutral-600">
                                        {(woodType.avgWasteRate * 100).toFixed(2)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {woodType.isActive ? (
                                        <span className="badge badge-success">Active</span>
                                    ) : (
                                        <span className="badge badge-neutral">Inactive</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

