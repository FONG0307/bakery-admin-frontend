"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createProduct,updateProduct,deleteProduct, addProductStock, getCategories, getSubcategories } from "@/lib/product";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { getProductsPaginated } from "@/lib/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import ImageCropModal from "@/components/admin/ImageCropModal";
import { createCategory, createSubcategory, deleteCategory, getCategoriesAdmin, getSubcategoriesAdmin, updateCategory, updateSubcategory } from "@/lib/category";

export default function TestProductsPage() {

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const {
    data: products,
    meta,
    page,
    setPage,
    reload,
  } = usePaginatedFetch(getProductsPaginated, { debounce: 300 });

  const filteredProducts = useMemo(() => {
    if (selectedStatuses.length === 0) return products;
    return products.filter((p) =>
      selectedStatuses.includes(statusText(p))
    );
  }, [products, selectedStatuses]);

  function CategoryManager({
    onClose,
  }: {
    onClose: () => void;
  }) {
    const [categories, setCategories] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [editing, setEditing] = useState<any | null>(null);
    const [editingSub, setEditingSub] = useState<any | null>(null);
    const [subName, setSubName] = useState("");
    const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const didLoad = useRef(false);
    

    async function load() {
      const [cats, subs] = await Promise.all([
        getCategoriesAdmin(),
        getSubcategories(),
      ]);

      setCategories(cats);
      setSubcategories(subs);
    }

    useEffect(() => {
      if (didLoad.current) return;
      didLoad.current = true;

      load();
    }, []);
    
    const subMap = useMemo(() => {
      const map: Record<number, any[]> = {};
      categories.forEach((cat) => {
        map[cat.id] = [];
      });

      subcategories.forEach((sub) => {
        const catId = sub.category?.id;
        if (!catId) return;
        if (!map[catId]) map[catId] = [];
        map[catId].push(sub);
      });

      return map;
    }, [categories, subcategories]);



    async function save() {
      if (!name.trim()) return;
      if (editing) {
        await updateCategory(editing.id, { name });
      } else {
        await createCategory({ name });
      }
      setName("");
      setEditing(null);
      load();
    }

    async function remove(id: number) {
      if (!confirm("Delete this category?")) return;
      await deleteCategory(id);
      load();
    }
    function editSubcategory(sub: any) {
      setEditingSub(sub);
      setSubName(sub.name);
      setParentCategoryId(sub.category_id);
    }
    function addSubcategory(categoryId: number) {
      setEditingSub(null);
      setSubName("");
      setParentCategoryId(categoryId);
    }
    function editCategory(cat: any) {
      setEditing(cat);
      setName(cat.name);
    }
    async function saveSubcategory() {
      if (!subName.trim() || !parentCategoryId) return;

      if (editingSub) {
        await updateSubcategory(editingSub.id, { name: subName });
      } else {
        await createSubcategory({
          name: subName,
          category_id: parentCategoryId,
        });
      }

      setEditingSub(null);
      setSubName("");
      setParentCategoryId(null);
      load();
    }
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-[420px] p-5 space-y-4">
          <h3 className="text-lg font-bold">Manage Categories</h3>

          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              onClick={save}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {editing ? "Update" : "Add"}
            </button>
          </div>

          <div className="divide-y">
            {parentCategoryId && (
              <div className="flex gap-2">
                <input
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Subcategory name"
                  className="flex-1 border px-3 py-2 rounded"
                />
                <button
                  onClick={async () => {
                    if (!subName.trim()) return;

                    if (editingSub) {
                      await updateSubcategory(editingSub.id, { name: subName });
                    } else {
                      await createSubcategory({
                        name: subName,
                        category_id: parentCategoryId,
                      });
                    }

                    setEditingSub(null);
                    setSubName("");
                    setParentCategoryId(null);
                    load();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {editingSub ? "Update Sub" : "Add Sub"}
                </button>
              </div>
            )}

            {categories.map((cat) => (
              <div key={cat.id} className="border rounded p-3 space-y-2">
                {/* CATEGORY */}
                <div className="flex justify-between font-semibold">
                  <span>{cat.name}</span>
                  <button
                    onClick={() => {
                      setEditing(cat);
                      setName(cat.name);
                    }}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>
                </div>

                <div className="ml-4 space-y-1">
                  {subMap[cat.id]?.map((sub) => (
                    <div key={sub.id} className="flex justify-between text-sm">
                      └ {sub.name}
                      <button
                        onClick={() => editSubcategory(sub)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                    </div>
                  ))}

                  {/* ADD SUB */}
                  <button
                    onClick={() => addSubcategory(cat.id)}
                    className="text-xs text-green-600"
                  >
                    + Add subcategory
                  </button>
                </div>
              </div>
            ))}


          </div>

          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  function nextPage() {
    if (page < meta?.total_pages) {
      setPage(page + 1);
    }
  }

  function prevPage() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  function handleFilterChange(status: string, checked: boolean) {
    setSelectedStatuses(prev =>
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
    setPage(1); // reset page
  }

  function handleSeeAll() {
    setSelectedStatuses([]);
    setPage(1);
  }

  function formatPrice(price: any) {
    return Number(price || 0).toLocaleString() + " ₫";
  }

  function formatDate(date: any) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  }

  function statusText(product: any) {
    const a = product?.daily_stock?.available ?? 0;
    if (a <= 0) return "Sold Out";
    if (a < 5) return "Low Stock";
    return "Available";
  }

  function isCake(product: any) {
    return product?.category?.slug === "cake";
  }

  function statusClass(product: any) {
    const a = product?.daily_stock?.available ?? 0;
    if (a <= 0) return "bg-red-100 text-red-700";
    if (a < 5) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  }

  function ProductForm({
    initial,
    onClose,
    onSaved,
  }: {
    initial?: any;
    onClose: () => void;
    onSaved: (p: any) => void;
  }) {
    useEffect(() => {
      async function load() {
        const [cats, subs] = await Promise.all([
          getCategoriesAdmin(),
          getSubcategoriesAdmin(),
        ]);
        setCategories(cats);
        setSubcategories(subs);
      }
      load();
    }, []);
    
    const [itemName, setItemName] = useState(initial?.item_name || "");
    const [categoryId, setCategoryId] = useState<number | "">(
      initial?.category?.id ?? ""
    );
    const [subcategoryId, setSubcategoryId] = useState<number | "">(
      initial?.subcategory?.id ?? ""
    );
    const [price, setPrice] = useState(initial?.unit_price || "");
    const [image, setImage] = useState<File | null>(null);
    const [description, setDescription] = useState(initial?.description || "");
    const [rawImage, setRawImage] = useState<File | null>(null);
    const [showCrop, setShowCrop] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    
    const subMap = useMemo(() => {
      const map: Record<number, any[]> = {};
      subcategories.forEach((s) => {
        if (!map[s.category_id]) map[s.category_id] = [];
        map[s.category_id].push(s);
      });
      return map;
    }, [subcategories]);

    const filteredSubcategories = useMemo(() => {
      if (!categoryId) return [];
      return subcategories.filter(
        (s) => Number(s.category?.id) === Number(categoryId)
      );
    }, [categoryId, subcategories]);

    
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      const fd = new FormData();
      fd.append("product[item_name]", itemName);
      fd.append("product[category_id]", String(categoryId));
      fd.append("product[subcategory_id]", String(subcategoryId));
      fd.append("product[unit_price]", price);
      fd.append("product[description]", description);

      if (image) fd.append("image", image);
      console.log("IMAGE FILE:", image);
      const saved = initial
        ? await updateProduct(initial.id, fd)
        : await createProduct(fd);

      await onSaved(null);
      onClose();
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[450px] space-y-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white text-center">
            {initial ? "Edit Product" : "Add Product"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(Number(e.target.value));
                setSubcategoryId("");
              }}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subcategory
            </label>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(Number(e.target.value))}
              disabled={!categoryId}
            >
              <option value="">Select subcategory</option>
              {filteredSubcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
            <input
              type="number"
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        dark:bg-gray-700 dark:text-white"
              placeholder="Short description for product"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setRawImage(f);
                setShowCrop(true);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {showCrop && rawImage && (
            <ImageCropModal
                file={rawImage}
                onCancel={() => setShowCrop(false)}
                onCropped={(file) => {
                    console.log("CROPPED VALUE:", file, file?.constructor?.name);
                  setImage(file);
                  setShowCrop(false);
                }}
              />
           )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {initial ? "Update" : "Add"} Product
            </button>
          </div>
        </form>
      </div>
    );
  }



// =============================================================
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-10 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Bakery Products (Today)
          </h3>
          <p className="text-sm text-gray-500">Daily stock & product management</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            + Add Product
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={() => setShowFilter(true)}
          >
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={handleSeeAll}
          >
            See all
          </button>
          <button
            onClick={() => setShowCategoryManager(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Manage Categories
          </button>
        </div>  

      </div>

      {/* TABLE */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Product
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Category
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                SubCategory
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Stock Today
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Created
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"> </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredProducts.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image
                        width={50}
                        height={50}
                        src={
                          product.image_thumb_url ||
                          product.image_url ||
                          "/images/product/bakery-placeholder.png"
                        }                        
                        className="h-[50px] w-[50px]"
                        alt={product.item_name}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {product.item_name}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.category?.name ?? "-"}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.subcategory?.name ?? "-"}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatPrice(product.unit_price)}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {isCake(product) ? "-" : product.daily_stock?.available ?? 0}
                </TableCell>


                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {isCake(product) ? (
                    <Badge size="sm" color="info">Made to order</Badge>
                  ) : (
                    <Badge
                      size="sm"
                      color={
                        statusText(product) === "Sold Out"
                          ? "error"
                          : statusText(product) === "Low Stock"
                          ? "warning"
                          : "success"
                      }
                    >
                      {statusText(product)}
                    </Badge>
                  )}
                </TableCell>


                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatDate(product.created_at)}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <div className="flex justify-end gap-2 text-sm">
                    <button
                      disabled={isCake(product)}
                      onClick={() => {
                        if (isCake(product)) return;
                        setSelectedProduct(product);
                        setShowAddStock(true);
                      }}
                      title={isCake(product) ? "Cake is made to order – no stock" : "Add stock"}
                      className={`hover:underline
                        ${
                          isCake(product)
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-green-600"
                        }`}
                    >
                      Add Stock
                    </button>

                    <button
                      onClick={() => {
                        setEditing(product);
                        setOpenForm(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this product?")) return;
                        await deleteProduct(product.id);
                        reload();
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {showCategoryManager && (
        <CategoryManager
          onClose={() => {
            setShowCategoryManager(false);
            reload(); // reload products nếu category đổi
          }}
        />
      )}

      {showAddStock && selectedProduct && (
        <AddStockForm
          product={selectedProduct}
          reload={reload}
          onClose={() => {
            setShowAddStock(false);
            setSelectedProduct(null);
          }}
          onSaved={() => {
            setShowAddStock(false);
            setSelectedProduct(null);
          }}
        />
      )}
      
      {openForm && (
        
        <ProductForm
          initial={editing}
          onClose={() => setOpenForm(false)}
          onSaved={(saved) => {
            reload();
          }}
        />
      )}
      {/* PAGINATION */}
      <div className="flex justify-between py-4 border-t">
        <span className="text-sm text-gray-500">
          Page {meta?.page} / {meta?.total_pages}
        </span>

        <div className="flex gap-2">
          <button onClick={prevPage} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={nextPage} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
      
      {showFilter && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-[400px] p-5 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Products</h3>
            <div className="space-y-3">
              {["Available", "Low Stock", "Sold Out"].map((status) => (
                <label key={status} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={(e) => handleFilterChange(status, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{status}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowFilter(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  
  );
}

function AddStockForm({
  product,
  onClose,
  onSaved,
  reload,
}: {
  product: any;
  onClose: () => void;
  onSaved: () => void;
  reload: () => void;
}) {
  const [quantity, setQuantity] = useState<number>(0);
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD
  const [operation, setOperation] = useState<"add" | "set">("add");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload: any = { quantity: Number(quantity) };
      if (date) payload.date = date;
      if (operation) payload.operation = operation;
      await addProductStock(product.id, payload);
      onSaved();
      reload();
    } catch (err) {
      alert("Add stock failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function quickAddToday(q: number) {
    try {
      setSubmitting(true);
      await addProductStock(product.id, { quantity: q });
      onSaved();
    } catch (err) {
      alert("Add stock failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[460px] space-y-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white text-center">
          Add Stock — {product.item_name}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
            <input
              type="number"
              min={0}
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="e.g. 20"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date (optional)</label>
            <input
              type="date"
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to apply to today.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operation</label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              value={operation}
              onChange={(e) => setOperation(e.target.value as any)}
            >
              <option value="add">Add (increase)</option>
              <option value="set">Set exact stock</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => quickAddToday(20)}
              className="px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-300 dark:bg-green-900/20"
              disabled={submitting}
              title="Quick add 20 to today's stock"
            >
              +20 today
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button disabled={submitting || quantity <= 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
