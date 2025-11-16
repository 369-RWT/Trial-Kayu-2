import Link from "next/link";
import { Settings, Package, Users, Factory, DollarSign } from "lucide-react";

export default function MasterDataPage() {
  const masterData = [
    {
      title: "Wood Types",
      description: "Manage wood types, codes, and average waste rates",
      href: "/master/wood-types",
      icon: Package,
      count: "5 active",
    },
    {
      title: "Suppliers",
      description: "Manage supplier information and contact details",
      href: "/master/suppliers",
      icon: Users,
      count: "3 active",
    },
    {
      title: "Products",
      description: "Manage product types and standard waste rates",
      href: "/master/products",
      icon: Factory,
      count: "3 active",
    },
    {
      title: "Product Pricing",
      description: "Manage selling prices by product × wood type combinations",
      href: "/master/pricing",
      icon: DollarSign,
      count: "15 entries",
    },
    {
      title: "Workers",
      description: "Manage worker information and assignments",
      href: "/master/workers",
      icon: Users,
      count: "3 active",
    },
    {
      title: "Machines",
      description: "Manage machine types and capabilities",
      href: "/master/machines",
      icon: Settings,
      count: "3 active",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Master Data</h1>
        <p className="text-neutral-600 mt-2">
          Manage system configuration and reference data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masterData.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card card-hover p-6 group"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
                <item.icon className="h-6 w-6 text-primary-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-2">
                  {item.description}
                </p>
                <div className="text-xs text-neutral-500">{item.count}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Configuration Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Wood Type Configuration
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• Wood codes for log tag generation (JT, MR, MH, SG, KP)</li>
              <li>• Historical average waste rates</li>
              <li>• Active/inactive status management</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-neutral-900 mb-2">
              Pricing Matrix
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• Product × wood type selling prices</li>
              <li>• Effective date tracking</li>
              <li>• Price history maintenance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
