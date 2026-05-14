import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShoppingBag, MapPin, Plus, ChevronUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearCart } from "@/features/cart/cartSlice";
import { usePlaceOrderMutation } from "@/features/orders/ordersApi";
import { useGetAddressesQuery, useCreateAddressMutation } from "@/features/address/addressApi";
import { PATHS } from "@/routes/paths";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const addressSchema = z.object({
  label: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean(),
});
type AddressForm = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: addrData, isLoading: loadingAddresses } = useGetAddressesQuery();
  const [createAddress, { isLoading: creatingAddress }] = useCreateAddressMutation();
  const [placeOrder, { isLoading: placing }] = usePlaceOrderMutation();

  const addresses = addrData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset: resetAddr,
    formState: { errors: addrErrors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  });

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const effectiveAddressId =
    selectedAddressId ?? addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;

  async function handleSaveAddress(values: AddressForm) {
    try {
      const result = await createAddress(values).unwrap();
      if (result.data) {
        setSelectedAddressId(result.data.id);
        setShowNewAddress(false);
        resetAddr();
        toast.success("Address saved");
      }
    } catch {
      toast.error("Failed to save address");
    }
  }

  async function handlePlaceOrder() {
    if (!effectiveAddressId) {
      toast.error("Please select or add a delivery address");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    try {
      await placeOrder({
        addressId: effectiveAddressId,
        items: cartItems.map((i) => ({ mealId: i.mealId, quantity: i.quantity })),
        pointsToRedeem: 0,
        notes: notes || undefined,
      }).unwrap();
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      navigate(PATHS.CUSTOMER.ORDERS);
    } catch {
      toast.error("Failed to place order");
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <ShoppingBag size={48} className="mb-4 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-700">Your cart is empty</h2>
        <p className="mt-1 text-sm text-gray-400">Add some meals before checking out.</p>
        <button
          onClick={() => navigate(PATHS.CUSTOMER.MEALS)}
          className="mt-5 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          Browse Meals
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-5 text-xl font-semibold text-gray-800">Checkout</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: address + notes */}
        <div className="space-y-5 lg:col-span-3">

          {/* Delivery address */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin size={15} className="text-orange-500" /> Delivery Address
            </h2>

            {loadingAddresses ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : addresses.length === 0 && !showNewAddress ? (
              <p className="mb-3 text-sm text-gray-400">No saved addresses. Add one below.</p>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => {
                  const isSelected =
                    (selectedAddressId ?? addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id) ===
                    addr.id;
                  return (
                    <label
                      key={addr.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                        isSelected
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-0.5 accent-orange-500"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setShowNewAddress(false);
                        }}
                      />
                      <div className="text-sm">
                        {addr.label && (
                          <p className="font-medium text-gray-800">{addr.label}</p>
                        )}
                        <p className="text-gray-600">
                          {[addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ")}
                        </p>
                        <p className="text-gray-500">
                          {[addr.city, addr.state, addr.postalCode, addr.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {addr.isDefault && (
                          <span className="mt-0.5 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                            Default
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Add new address toggle */}
            <button
              type="button"
              onClick={() => setShowNewAddress((v) => !v)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              {showNewAddress ? (
                <><ChevronUp size={14} /> Cancel</>
              ) : (
                <><Plus size={14} /> Add new address</>
              )}
            </button>

            {showNewAddress && (
              <form
                onSubmit={handleSubmit(handleSaveAddress)}
                className="mt-3 space-y-3 rounded-lg border border-dashed border-gray-300 p-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input
                      {...register("label")}
                      placeholder="Label (e.g. Home, Work)"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      {...register("addressLine1")}
                      placeholder="Address line 1 *"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    {addrErrors.addressLine1 && (
                      <p className="mt-1 text-xs text-red-500">{addrErrors.addressLine1.message}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <input
                      {...register("addressLine2")}
                      placeholder="Address line 2"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <input
                      {...register("city")}
                      placeholder="City *"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    {addrErrors.city && (
                      <p className="mt-1 text-xs text-red-500">{addrErrors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register("state")}
                      placeholder="State"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <input
                      {...register("postalCode")}
                      placeholder="Postal code"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <input
                      {...register("country")}
                      placeholder="Country *"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    {addrErrors.country && (
                      <p className="mt-1 text-xs text-red-500">{addrErrors.country.message}</p>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" {...register("isDefault")} className="accent-orange-500" />
                  Set as default address
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creatingAddress}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {creatingAddress ? "Saving…" : "Save Address"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">Order Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for your order? (optional)"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </section>
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Order Summary</h2>

            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.mealId} className="flex items-center gap-3 py-2.5">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-orange-50">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.mealName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">{item.mealName}</p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800">
                <span>Total</span>
                <span className="text-orange-500">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !effectiveAddressId}
              className="mt-5 w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {placing ? "Placing Order…" : "Place Order"}
            </button>

            <button
              onClick={() => navigate(PATHS.CUSTOMER.MEALS)}
              className="mt-2 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              ← Back to Meals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
