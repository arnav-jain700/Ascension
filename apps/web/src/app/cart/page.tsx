"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-asc-matte mb-8">
          Shopping Cart
        </h1>
        
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-asc-charcoal"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M9 2L3 7v9a2 2 0 002 2h7a2 2 0 002-2V7l-6-5z" />
            <path d="M9 22V12h6v10" />
          </svg>
          
          <h2 className="text-xl font-semibold text-asc-matte mb-2">
            Your cart is empty
          </h2>
          
          <p className="text-asc-charcoal mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-asc-matte px-6 py-3 text-sm font-medium text-asc-canvas transition-colors hover:bg-asc-charcoal"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-asc-matte mb-8">
        Shopping Cart
      </h1>
      
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border border-asc-border rounded-lg">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-asc-border">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-asc-matte mb-1">{item.name}</h3>
                <p className="text-sm text-asc-charcoal capitalize mb-2">
                  {item.variant.size} • {item.variant.color}
                </p>
                <p className="text-sm font-medium text-asc-matte mb-3">
                  ₹{item.variant.price.toLocaleString()}
                </p>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border border-asc-border rounded">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1 text-asc-matte hover:bg-asc-accent hover:text-asc-canvas disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="px-2 py-1 text-sm text-asc-matte min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-asc-matte hover:bg-asc-accent hover:text-asc-canvas transition-colors"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-asc-charcoal hover:text-asc-matte transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-lg border border-asc-border p-6">
            <h2 className="text-lg font-semibold text-asc-matte mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Subtotal</span>
                <span className="font-medium text-asc-matte">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Shipping</span>
                <span className="font-medium text-asc-matte">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Tax</span>
                <span className="font-medium text-asc-matte">Calculated at checkout</span>
              </div>
              <div className="border-t border-asc-border pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-asc-matte">Total</span>
                  <span className="font-bold text-lg text-asc-matte">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.href = "/checkout"}
              className="w-full rounded-md bg-asc-matte px-4 py-3 text-sm font-medium text-asc-canvas transition-colors hover:bg-asc-charcoal mb-3"
            >
              Proceed to Checkout
            </button>

            <div className="text-center">
              <Link
                href="/products"
                className="text-sm text-asc-accent hover:text-asc-matte transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            <button
              onClick={clearCart}
              className="w-full text-sm text-asc-charcoal hover:text-asc-matte transition-colors mt-3"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
