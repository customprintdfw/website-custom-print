import { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@animaapp/playground-react-sdk";

export interface CartItem {
  cartId: string;
  product: Product;
  quantity: string;
  size?: string;
  paper?: string;
  color?: string;
  coating?: string;
  cardSlit?: string;
  productionTime?: string;
  subtotal: string;
  designFile?: File;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "cartId">) => void;
  removeItem: (cartId: string) => void;
  updateItemFile: (cartId: string, file: File | undefined) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, "cartId">) => {
    const cartId = `${item.product.id}-${Date.now()}`;
    setItems((prev) => [...prev, { ...item, cartId }]);
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const updateItemFile = useCallback((cartId: string, file: File | undefined) => {
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, designFile: file } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.subtotal || "0"), 0);

  return (
    <CartContext.Provider
      value={{ items, isOpen, addItem, removeItem, updateItemFile, clearCart, openCart, closeCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
