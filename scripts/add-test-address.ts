import mongoose from 'mongoose';

// Make sure .env.local is loaded by the app
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthebites';

const testAddress = {
  fullName: "Amol Kumar",
  mobile: "9999999999",
  pincode: "803101",
  state: "Bihar",
  city: "Munger",
  area: "Mansarover Colony",
  landmark: "Near Main Road",
  isDefault: true,
};

async function addTestAddress() {
  try {
    console.log("Connecting to:", MONGO_URI?.substring(0, 50) + '...');
    await mongoose.connect(MONGO_URI);
    console.log("✓ Database connected");

    const userSchema = new mongoose.Schema({
      addresses: [{
        fullName: String,
        mobile: String,
        pincode: String,
        state: String,
        city: String,
        area: String,
        landmark: String,
        isDefault: Boolean
      }]
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const userId = "69b2324131cc61633a72260c";
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: testAddress } },
      { new: true }
    );

    if (user) {
      console.log("✓ Address added successfully!");
      console.log("📍 Addresses count:", user.addresses.length);
    } else {
      console.log("❌ User not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addTestAddress();
