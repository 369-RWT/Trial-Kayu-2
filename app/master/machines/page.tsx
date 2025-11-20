import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getMachineTypes() {
    const machineTypes = await prisma.machineType.findMany({
        orderBy: {
            machineName: "asc",
        },
    });

    return machineTypes;
}

export default async function MachinesPage() {
    const machineTypes = await getMachineTypes();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Machine Types</h1>
                    <p className="text-neutral-600 mt-1">
                        {machineTypes.length} machine types configured
                    </p>
                </div>
                <Link href="/master/machines/new" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Machine Type
                </Link>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {machineTypes.map((machine) => (
                            <tr key={machine.id} className="hover:bg-neutral-50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        href={`/master/machines/${machine.id}`}
                                        className="font-medium text-primary-600 hover:text-primary-800"
                                    >
                                        {machine.machineName}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-neutral-600">
                                        {machine.description || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {machine.isActive ? (
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

