import Link from "next/link";
import { ArrowRight, Package, TrendingUp, AlertCircle } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-neutral-600 mt-2">
          Multi-wood type tracking with weighted average costing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/inventory/logs"
          className="card card-hover p-8 flex items-start space-x-4 group"
        >
          <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary-200 transition-colors">
            <Package className="h-8 w-8 text-primary-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Log Inventory
            </h2>
            <p className="text-neutral-600 mb-4">
              Manage log purchases, track kubikasi, and monitor stock levels by
              wood type
            </p>
            <div className="flex items-center text-primary-600 font-medium">
              Manage Logs
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </Link>

        <Link
          href="/inventory/valuation"
          className="card card-hover p-8 flex items-start space-x-4 group"
        >
          <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary-200 transition-colors">
            <TrendingUp className="h-8 w-8 text-primary-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Inventory Valuation
            </h2>
            <p className="text-neutral-600 mb-4">
              View weighted average costs, inventory movements, and valuations
              by wood type
            </p>
            <div className="flex items-center text-primary-600 font-medium">
              View Valuations
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </Link>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Log Purchase Recording
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• Automatic log tag generation</li>
              <li>• Kubikasi calculation (FLOOR method)</li>
              <li>• Wood type segregation</li>
              <li>• Supplier tracking</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Weighted Average Costing
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• Separate WAC per wood type</li>
              <li>• Real-time inventory valuation</li>
              <li>• FIFO consumption tracking</li>
              <li>• Purchase history analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
