import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";

async function checkDatabase() {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Find the specific product
    const product = await Product.findOne({
      slug: "traditional-raw-makhana-2"
    });

    if (!product) {
      console.log("❌ Product not found with that slug");
      
      // List all products
      const allProducts = await Product.find({});
      console.log(`Found ${allProducts.length} total products`);
      allProducts.slice(0, 5).forEach((p: any) => {
        console.log(`  - ${p.name} (${p.slug}): images=${p.images?.length || 0}`);
      });
      return;
    }

    console.log("Product found:", {
      name: product.name,
      slug: product.slug,
      images: product.images,
      imagesLength: product.images?.length,
      imageArray: Array.isArray(product.images),
      allProps: Object.keys(product).filter(k => k !== '_doc')
    });

  } catch (error) {
    console.error("Error:", error);
  }
}

checkDatabase();
