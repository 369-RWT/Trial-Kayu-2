import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

const prisma = new PrismaClient();

async function getSuppliers() {
    const suppliers = await prisma.supplier.findMany({
        orderBy: {
            supplierCode: "asc",
        },
    });

    return suppliers;
}

export default async function SuppliersPage() {
    const suppliers = await getSuppliers();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                    <p className="text-neutral-600 mt-1">
                        {suppliers.length} suppliers configured
                    </p>
                </div>
                <Link href="/master/suppliers/new" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
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
                                Contact Person
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-neutral-50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        href={`/master/suppliers/${supplier.id}`}
                                        className="font-mono font-semibold text-sm text-primary-600 hover:text-primary-800"
                                    >
                                        {supplier.supplierCode}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-neutral-900">
                                        {supplier.supplierName}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-neutral-600">
                                        {supplier.contactPerson || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-neutral-600">
                                        {supplier.phone || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {supplier.isActive ? (
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
