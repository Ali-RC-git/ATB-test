'use client';

interface CartItem {
  name: string;
  specs: string;
  price: string;
  quantity: number;
  total: string;
  image: string;
}

interface CartSectionProps {
  cartItems: CartItem[];
}

export default function CartSection({ cartItems }: CartSectionProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
      <div className="space-y-3">
        {cartItems.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 flex gap-3">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-gray-500 text-sm">{item.specs}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-green-600 font-semibold">{item.price}</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <span className="font-semibold">{item.total}</span>
                <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total: $87.84</span>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}