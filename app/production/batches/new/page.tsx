"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface WoodType {
  id: number;
  woodCode: string;
  woodName: string;
}

interface Product {
  id: number;
  productCode: string;
  productName: string;
}

interface Worker {
  id: number;
  workerCode: string;
  workerName: string;
}

interface MachineType {
  id: number;
  machineName: string;
}

interface BatchLineItem {
  woodTypeId: string;
  productId: string;
  targetKubikasi: string;
  workerId: string;
  machineTypeId: string;
}

export default function NewProductionBatchPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [productionDate, setProductionDate] = useState("");
  const [shift, setShift] = useState("1");
  const [lineItems, setLineItems] = useState<BatchLineItem[]>([
    {
      woodTypeId: "",
      productId: "",
      targetKubikasi: "",
      workerId: "",
      machineTypeId: "",
    },
  ]);

  // Master data
  const [woodTypes, setWoodTypes] = useState<WoodType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [woodTypesRes, productsRes, workersRes, machinesRes] =
          await Promise.all([
            fetch("/api/master/wood-types"),
            fetch("/api/master/products"),
            fetch("/api/master/workers"),
            fetch("/api/master/machine-types"),
          ]);

        if (woodTypesRes.ok) {
          const data = await woodTypesRes.json();
          setWoodTypes(data.woodTypes || []);
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }
        if (workersRes.ok) {
          const data = await workersRes.json();
          setWorkers(data.workers || []);
        }
        if (machinesRes.ok) {
          const data = await machinesRes.json();
          setMachineTypes(data.machineTypes || []);
        }
      } catch (err) {
        console.error("Error fetching master data:", err);
      }
    };

    if (status === "authenticated") {
      fetchMasterData();
    }
  }, [status]);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setProductionDate(today);
  }, []);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        woodTypeId: "",
        productId: "",
        targetKubikasi: "",
        workerId: "",
        machineTypeId: "",
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (
    index: number,
    field: keyof BatchLineItem,
    value: string
  ) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate line items
      const validLineItems = lineItems.filter(
        (item) =>
          item.woodTypeId &&
          item.productId &&
          item.targetKubikasi &&
          parseFloat(item.targetKubikasi) > 0
      );

      if (validLineItems.length === 0) {
        setError(
          "Please add at least one valid line item with wood type, product, and target kubikasi"
        );
        setLoading(false);
        return;
      }

      // Prepare request body
      const requestBody = {
        productionDate: new Date(productionDate).toISOString(),
        shift: parseInt(shift),
        lineItems: validLineItems.map((item) => ({
          woodTypeId: parseInt(item.woodTypeId),
          productId: parseInt(item.productId),
          targetKubikasi: parseFloat(item.targetKubikasi),
          workerId: item.workerId ? parseInt(item.workerId) : undefined,
          machineTypeId: item.machineTypeId
            ? parseInt(item.machineTypeId)
            : undefined,
        })),
      };

      const response = await fetch("/api/production/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create production batch");
      }

      setSuccess(`Production batch ${data.batch.id} created successfully!`);
      setTimeout(() => {
        router.push("/production/batches");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const userRole = session.user.role;
  if (!["ADMIN", "MANAGER", "OPERATOR"].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You do not have permission to create production batches.
          </p>
          <Link
            href="/production/batches"
            className="text-blue-600 hover:underline"
          >
            Back to Production Batches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/production/batches"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Production Batch
          </h1>
          <p className="text-gray-600 mt-2">
            Plan a new production batch with multiple line items
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Batch Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Production Date *
                </label>
                <input
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shift *
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Shift 1</option>
                  <option value="2">Shift 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">
                      Item {index + 1}
                    </h3>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wood Type *
                      </label>
                      <select
                        value={item.woodTypeId}
                        onChange={(e) =>
                          updateLineItem(index, "woodTypeId", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select wood type</option>
                        {woodTypes.map((wt) => (
                          <option key={wt.id} value={wt.id}>
                            {wt.woodCode} - {wt.woodName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product *
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateLineItem(index, "productId", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.productCode} - {p.productName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Kubikasi (m³) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.targetKubikasi}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "targetKubikasi",
                            e.target.value
                          )
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Worker (Optional)
                      </label>
                      <select
                        value={item.workerId}
                        onChange={(e) =>
                          updateLineItem(index, "workerId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select worker</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.workerCode} - {w.workerName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Machine Type (Optional)
                      </label>
                      <select
                        value={item.machineTypeId}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "machineTypeId",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select machine type</option>
                        {machineTypes.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.machineName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/production/batches"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
