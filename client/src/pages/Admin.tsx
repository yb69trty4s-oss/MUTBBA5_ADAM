import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, Product, DeliveryLocation } from "@shared/schema";
import { unitTypes } from "@shared/schema";
import { Plus, X, Upload, Loader2, Pencil, Check, Trash2, MapPin } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Product states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editUnitType, setEditUnitType] = useState("");
  
  // Delivery location states
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationPrice, setLocationPrice] = useState("");
  const [locationFile, setLocationFile] = useState<File | null>(null);
  const [uploadingLocation, setUploadingLocation] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: deliveryLocations = [] } = useQuery<DeliveryLocation[]>({
    queryKey: ["/api/delivery-locations"],
  });

  const createProduct = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: number;
      unitType: string;
      categoryId: number;
      image: string;
      isPopular: boolean;
    }) => {
      return apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowAddProduct(false);
      setImageUrl("");
      setSelectedFile(null);
      toast({ title: "تمت إضافة المنتج" });
    },
    onError: () => {
      toast({ title: "فشل في إضافة المنتج", variant: "destructive" });
    },
  });

  const updateProductPrice = useMutation({
    mutationFn: async ({ id, price, unitType }: { id: number; price: number; unitType: string }) => {
      return apiRequest("PATCH", `/api/products/${id}/price`, { price, unitType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProductId(null);
      setEditPrice("");
      setEditUnitType("");
      toast({ title: "تم تحديث السعر" });
    },
    onError: () => {
      toast({ title: "فشل في تحديث السعر", variant: "destructive" });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم حذف المنتج" });
    },
    onError: () => {
      toast({ title: "فشل في حذف المنتج", variant: "destructive" });
    },
  });

  const createDeliveryLocation = useMutation({
    mutationFn: async (data: { name: string; price: number; image: string }) => {
      return apiRequest("POST", "/api/delivery-locations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-locations"] });
      setShowAddLocation(false);
      setLocationName("");
      setLocationPrice("");
      setLocationFile(null);
      toast({ title: "تمت إضافة المنطقة" });
    },
    onError: () => {
      toast({ title: "فشل في إضافة المنطقة", variant: "destructive" });
    },
  });

  const deleteDeliveryLocation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/delivery-locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-locations"] });
      toast({ title: "تم حذف المنطقة" });
    },
    onError: () => {
      toast({ title: "فشل في حذف المنطقة", variant: "destructive" });
    },
  });

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const authRes = await fetch("/api/imagekit/auth");
      if (!authRes.ok) {
        throw new Error("ImageKit not configured");
      }
      const authParams = await authRes.json();

      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${folder}_${Date.now()}.${ext}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
      formData.append("publicKey", authParams.publicKey);
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire.toString());
      formData.append("token", authParams.token);

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const result = await uploadRes.json();
      return result.url;
    } catch (error) {
      toast({ title: "فشل رفع الصورة", variant: "destructive" });
      return null;
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string) * 100;
    const unitType = formData.get("unitType") as string;
    const categoryId = parseInt(formData.get("categoryId") as string);
    const isPopular = formData.get("isPopular") === "true";

    setUploading(true);
    let finalImageUrl = imageUrl;
    
    if (selectedFile && !imageUrl) {
      const uploadedUrl = await uploadImage(selectedFile, "product");
      if (!uploadedUrl) {
        setUploading(false);
        return;
      }
      finalImageUrl = uploadedUrl;
    }
    setUploading(false);
    
    createProduct.mutate({
      name,
      description,
      price,
      unitType,
      categoryId,
      image: finalImageUrl,
      isPopular,
    });
  };

  const handleLocationSubmit = async () => {
    if (!locationName || !locationPrice || !locationFile) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }

    setUploadingLocation(true);
    const uploadedUrl = await uploadImage(locationFile, "delivery_location");
    setUploadingLocation(false);

    if (!uploadedUrl) return;

    createDeliveryLocation.mutate({
      name: locationName,
      price: parseFloat(locationPrice) * 100,
      image: uploadedUrl,
    });
  };

  const startEditing = (product: Product) => {
    setEditingProductId(product.id);
    setEditPrice((product.price / 100).toString());
    setEditUnitType(product.unitType || "حبة");
  };

  const savePrice = () => {
    if (editingProductId !== null && editPrice) {
      const price = parseFloat(editPrice) * 100;
      updateProductPrice.mutate({ id: editingProductId, price, unitType: editUnitType });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-admin-title">
            لوحة التحكم
          </h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            رجوع
          </Button>
        </div>

        <div className="space-y-6">
          {/* Delivery Locations Section */}
          <Card data-testid="card-delivery-locations">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                مناطق التوصيل ({deliveryLocations.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddLocation(true)}
                data-testid="button-add-location"
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة
              </Button>
            </CardHeader>
            <CardContent>
              {showAddLocation && (
                <div className="border rounded-md p-4 mb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">منطقة جديدة</h3>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowAddLocation(false);
                        setLocationName("");
                        setLocationPrice("");
                        setLocationFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اسم المنطقة</Label>
                      <Input
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="مثال: عمان - الشميساني"
                        data-testid="input-location-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>سعر التوصيل (د.أ)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={locationPrice}
                        onChange={(e) => setLocationPrice(e.target.value)}
                        placeholder="مثال: 2.5"
                        data-testid="input-location-price"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>صورة المنطقة</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLocationFile(e.target.files?.[0] || null)}
                      data-testid="input-location-image"
                    />
                    {locationFile && (
                      <img
                        src={URL.createObjectURL(locationFile)}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-md mt-2"
                      />
                    )}
                  </div>

                  <Button
                    onClick={handleLocationSubmit}
                    disabled={!locationName || !locationPrice || !locationFile || uploadingLocation || createDeliveryLocation.isPending}
                    data-testid="button-save-location"
                  >
                    {uploadingLocation || createDeliveryLocation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Upload className="h-4 w-4 ml-2" />
                    )}
                    {uploadingLocation ? "جاري الرفع..." : "حفظ المنطقة"}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliveryLocations.map((location) => (
                  <div
                    key={location.id}
                    className="border rounded-md p-3 flex gap-3"
                    data-testid={`card-location-${location.id}`}
                  >
                    <img
                      src={location.image}
                      alt={location.name}
                      className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{location.name}</p>
                      <p className="text-sm text-primary font-bold">
                        {(location.price / 100).toFixed(2)} د.أ
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive h-8 w-8"
                      onClick={() => deleteDeliveryLocation.mutate(location.id)}
                      data-testid={`button-delete-location-${location.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories Section */}
          <Card data-testid="card-categories">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>التصنيفات ({categories.length})</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="اسم التصنيف الجديد"
                  className="w-48 h-8"
                  id="new-category-name"
                />
                <Button
                  size="sm"
                  onClick={async () => {
                    const input = document.getElementById("new-category-name") as HTMLInputElement;
                    const name = input.value;
                    if (!name) return;
                    
                    try {
                      await apiRequest("POST", "/api/categories", { 
                        name, 
                        slug: name.toLowerCase().replace(/\s+/g, '-'),
                        image: "/images/hero1.png" // default image
                      });
                      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
                      input.value = "";
                      toast({ title: "تم إضافة التصنيف" });
                    } catch (e) {
                      toast({ title: "فشل إضافة التصنيف", variant: "destructive" });
                    }
                  }}
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="border rounded-md p-2 text-center bg-muted/30">
                    <p className="font-medium text-sm">{cat.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card data-testid="card-products">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>المنتجات ({products.length})</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddProduct(true)}
                data-testid="button-add-product"
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة
              </Button>
            </CardHeader>
            <CardContent>
              {showAddProduct && (
                <form onSubmit={handleProductSubmit} className="border rounded-md p-4 mb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">منتج جديد</h3>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowAddProduct(false);
                        setImageUrl("");
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        data-testid="input-product-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">السعر</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        required
                        placeholder="مثال: 2.5"
                        data-testid="input-product-price"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unitType">الوحدة</Label>
                      <Select name="unitType" defaultValue="حبة">
                        <SelectTrigger data-testid="select-unit-type">
                          <SelectValue placeholder="اختر الوحدة" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitTypes.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryId">التصنيف</Label>
                      <Select name="categoryId" required>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isPopular">مشهور</Label>
                      <Select name="isPopular" defaultValue="false">
                        <SelectTrigger data-testid="select-popular">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">لا</SelectItem>
                          <SelectItem value="true">نعم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      data-testid="input-product-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الصورة</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            setImageUrl("");
                          }
                        }}
                        data-testid="input-product-image"
                        disabled={uploading}
                      />
                      {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    {selectedFile && (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-md mt-2"
                        data-testid="img-product-preview"
                      />
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={!selectedFile || uploading || createProduct.isPending}
                    data-testid="button-save-product"
                  >
                    {uploading || createProduct.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Upload className="h-4 w-4 ml-2" />
                    )}
                    {uploading ? "جاري الرفع..." : "حفظ المنتج"}
                  </Button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-md p-3 flex gap-3"
                    data-testid={`card-product-${product.id}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      
                      {editingProductId === product.id ? (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="h-8 w-24"
                              placeholder="السعر"
                              data-testid={`input-edit-price-${product.id}`}
                            />
                            <Select value={editUnitType} onValueChange={setEditUnitType}>
                              <SelectTrigger className="h-8 w-20" data-testid={`select-edit-unit-${product.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {unitTypes.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={savePrice}
                              disabled={updateProductPrice.isPending}
                              data-testid={`button-save-price-${product.id}`}
                            >
                              {updateProductPrice.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingProductId(null);
                                setEditPrice("");
                                setEditUnitType("");
                              }}
                              data-testid={`button-cancel-edit-${product.id}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground">
                            {(product.price / 100).toFixed(2)} د.أ / {product.unitType || "حبة"}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => startEditing(product)}
                              data-testid={`button-edit-price-${product.id}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive"
                              onClick={() => deleteProduct.mutate(product.id)}
                              disabled={deleteProduct.isPending}
                              data-testid={`button-delete-product-${product.id}`}
                            >
                              {deleteProduct.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
