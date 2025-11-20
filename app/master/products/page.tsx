import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getProducts() {
    const products = await prisma.product.findMany({
        include: {
            machineType: true,
        },
        orderBy: {
            productCode: "asc",
        },
    });

    return products;
}

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-neutral-600 mt-1">
                        {products.length} products configured
                    </p>
                </div>
                <Link href="/master/products/new" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
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
                                Machine Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Standard Waste Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-neutral-50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        href={`/master/products/${product.id}`}
                                        className="font-mono font-semibold text-sm text-primary-600 hover:text-primary-800"
                                    >
                                        {product.productCode}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-neutral-900">
                                        {product.productName}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-neutral-600">
                                        {product.machineType?.machineName || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-neutral-600">
                                        {(product.standardWasteRate * 100).toFixed(2)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.isActive ? (
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

