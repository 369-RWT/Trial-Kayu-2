import { PrismaClient } from "@prisma/client";
import LogPurchaseForm from "@/components/forms/LogPurchaseForm";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getFormData() {
  const [woodTypes, suppliers] = await Promise.all([
    prisma.woodType.findMany({
      where: { isActive: true },
      orderBy: { woodName: "asc" },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { supplierName: "asc" },
    }),
  ]);

  return { woodTypes, suppliers };
}

export default async function NewLogPurchasePage() {
  const { woodTypes, suppliers } = await getFormData();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record Log Purchase</h1>
        <p className="text-neutral-600 mt-2">
          Add new log to inventory with automatic kubikasi calculation
        </p>
      </div>

      <LogPurchaseForm woodTypes={woodTypes} suppliers={suppliers} />
    </div>
  );
}

