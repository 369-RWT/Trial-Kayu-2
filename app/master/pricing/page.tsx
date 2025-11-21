import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getPricing() {
    const pricing = await prisma.productPricing.findMany({
        include: {
            product: true,
            woodType: true,
        },
        orderBy: [
            { product: { productCode: "asc" } },
            { woodType: { woodCode: "asc" } },
        ],
    });

    return pricing;
}

export default async function PricingPage() {
    const pricing = await getPricing();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Pricing</h1>
                    <p className="text-neutral-600 mt-1">
                        {pricing.length} pricing entries configured
                    </p>
                </div>
                <Link href="/master/pricing/new" className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pricing
                </Link>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Wood Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Price per Kubik
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Effective Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {pricing.map((entry) => (
                            <tr key={entry.id} className="hover:bg-neutral-50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        href={`/master/pricing/${entry.id}`}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-800"
                                    >
                                        {entry.product.productName}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-sm text-neutral-600">
                                        {entry.woodType.woodCode} - {entry.woodType.woodName}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-neutral-900">
                                        Rp {entry.sellingPricePerKubik.toLocaleString("id-ID")}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-neutral-600">
                                        {new Date(entry.effectiveDate).toLocaleDateString("id-ID")}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {entry.isActive ? (
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

