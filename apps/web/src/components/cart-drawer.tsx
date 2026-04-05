"use client";

import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/hooks/use-cart";
import Image from "next/image";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const totalPrice = getTotalPrice();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-asc-canvas shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-asc-border p-4">
            <h2 className="text-lg font-semibold text-asc-matte">Shopping Cart</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-asc-charcoal hover:text-asc-matte transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
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
                <p className="text-asc-charcoal mb-4">Your cart is empty</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-asc-accent hover:text-asc-matte transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onRemove={() => removeItem(item.id)}
                    onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-asc-border p-4">
              <div className="space-y-3 mb-4">
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
                <div className="border-t border-asc-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-asc-matte">Total</span>
                    <span className="font-bold text-lg text-asc-matte">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = "/checkout";
                  }}
                  className="w-full bg-asc-matte text-asc-canvas px-4 py-3 font-medium rounded-md transition-colors hover:bg-asc-charcoal"
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full border border-asc-border text-asc-matte px-4 py-3 font-medium rounded-md transition-colors hover:border-asc-accent hover:text-asc-accent"
                >
                  Continue Shopping
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-sm text-asc-charcoal hover:text-asc-matte transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ item, onRemove, onUpdateQuantity }: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  return (
    <div className="flex gap-4 p-3 border border-asc-border rounded-lg">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-asc-border">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-asc-matte text-sm truncate">{item.name}</h3>
        <p className="text-xs text-asc-charcoal capitalize">
          {item.variant.size} • {item.variant.color}
        </p>
        <p className="text-sm font-medium text-asc-matte">
          ₹{item.variant.price.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={onRemove}
          className="p-1 text-asc-charcoal hover:text-asc-matte transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
          </svg>
        </button>

        <div className="flex items-center gap-1 border border-asc-border rounded">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
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
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="p-1 text-asc-matte hover:bg-asc-accent hover:text-asc-canvas transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
