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
import type { Category, Product } from "@shared/schema";
import { Plus, X, Upload, Loader2 } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createProduct = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: number;
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
      toast({ title: "Product added" });
    },
    onError: () => {
      toast({ title: "Failed to add product", variant: "destructive" });
    },
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const authRes = await fetch("/api/imagekit/auth");
      if (!authRes.ok) {
        throw new Error("ImageKit not configured");
      }
      const authParams = await authRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
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
      setImageUrl(result.url);
    } catch (error) {
      toast({ title: "Image upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createProduct.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseInt(formData.get("price") as string) * 100,
      categoryId: parseInt(formData.get("categoryId") as string),
      image: imageUrl,
      isPopular: formData.get("isPopular") === "true",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-admin-title">
            Admin
          </h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            Back
          </Button>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-products">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Products ({products.length})</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddProduct(true)}
                data-testid="button-add-product"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {showAddProduct && (
                <form onSubmit={handleSubmit} className="border rounded-md p-4 mb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">New Product</h3>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowAddProduct(false);
                        setImageUrl("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        data-testid="input-product-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        required
                        data-testid="input-product-price"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Category</Label>
                      <Select name="categoryId" required>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
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
                      <Label htmlFor="isPopular">Popular</Label>
                      <Select name="isPopular" defaultValue="false">
                        <SelectTrigger data-testid="select-popular">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      data-testid="input-product-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        data-testid="input-product-image"
                        disabled={uploading}
                      />
                      {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-md mt-2"
                        data-testid="img-product-preview"
                      />
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={!imageUrl || createProduct.isPending}
                    data-testid="button-save-product"
                  >
                    {createProduct.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Save Product
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
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(product.price / 100).toFixed(2)}
                      </p>
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
