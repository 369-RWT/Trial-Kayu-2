import Link from "next/link";
import { ArrowRight, Factory, FileText, AlertCircle } from "lucide-react";

export default function ProductionPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Production Management
        </h1>
        <p className="text-neutral-600 mt-2">
          Plan batches, track output, and analyze waste by wood type
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/production/batches"
          className="card card-hover p-8 flex items-start space-x-4 group"
        >
          <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary-200 transition-colors">
            <Factory className="h-8 w-8 text-primary-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Production Batches
            </h2>
            <p className="text-neutral-600 mb-4">
              Create and manage production batches with wood type × product type
              line items
            </p>
            <div className="flex items-center text-primary-600 font-medium">
              Manage Batches
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </Link>

        <Link
          href="/production/waste"
          className="card card-hover p-8 flex items-start space-x-4 group"
        >
          <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary-200 transition-colors">
            <AlertCircle className="h-8 w-8 text-primary-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Waste Tracking
            </h2>
            <p className="text-neutral-600 mb-4">
              Track waste deviations by type, supplier, and wood quality
            </p>
            <div className="flex items-center text-primary-600 font-medium">
              View Waste Analysis
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </Link>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Production Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Batch Planning
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• Multi-line batch planning</li>
              <li>• Wood type × product type combinations</li>
              <li>• Machine and worker assignment</li>
              <li>• Target kubikasi setting</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Log Allocation
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• FIFO log consumption</li>
              <li>• WAC locking at batch start</li>
              <li>• Automatic log tag tracking</li>
              <li>• Supplier attribution</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Waste Attribution
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• Wood type specific tracking</li>
              <li>• Supplier quality analysis</li>
              <li>• Recovery value estimation</li>
              <li>• Disposition management</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <div className="flex items-start">
          <FileText className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Production Workflow</h4>
            <p className="text-sm mt-1">
              1. Create batch with line items → 2. System allocates logs (FIFO)
              → 3. Record production output → 4. Track waste deviations → 5.
              Calculate costs & margins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
