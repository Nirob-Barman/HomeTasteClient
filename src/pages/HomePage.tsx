import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  ChefHat,
  Zap,
  Gift,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { PATHS } from "@/routes/paths";
import { usePageTitle } from "@/hooks/usePageTitle";

const steps = [
  {
    icon: UtensilsCrossed,
    title: "Browse the Menu",
    desc: "Explore fresh home-cooked meals crafted with care every day.",
  },
  {
    icon: ShoppingBag,
    title: "Place Your Order",
    desc: "Add to cart, pick your address, and checkout in seconds.",
  },
  {
    icon: Truck,
    title: "Get It Delivered",
    desc: "Your meal arrives hot and fresh right at your door.",
  },
];

const features = [
  {
    icon: ChefHat,
    title: "Home-Cooked Quality",
    desc: "Real recipes, real ingredients — no factory shortcuts.",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    desc: "Optimised routes mean your food arrives while it's still hot.",
  },
  {
    icon: Gift,
    title: "Loyalty Rewards",
    desc: "Earn points on every order and redeem them for discounts.",
  },
  {
    icon: MapPin,
    title: "Live Order Tracking",
    desc: "Follow your order from kitchen to door in real time.",
  },
];

export default function HomePage() {
  usePageTitle("Home");
  return (
    <>
      {/* Hero */}
      <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-100">
          <UtensilsCrossed size={48} className="text-orange-300" />
        </div>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Delicious Home-Cooked Meals,{" "}
          <span className="text-orange-500">Delivered Fresh</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-gray-500">
          Order from a curated menu of lovingly prepared dishes and have them
          delivered to your door — fast.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={PATHS.REGISTER}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            Get Started <ArrowRight size={16} />
          </Link>
          <Link
            to={PATHS.LOGIN}
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-800">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                  <Icon size={26} className="text-orange-500" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-800">
                  {title}
                </h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HomeTaste */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-800">
            Why HomeTaste?
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <Icon size={20} className="text-orange-500" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-gray-800">
                  {title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} HomeTaste ·{" "}
        <Link to={PATHS.LOGIN} className="hover:text-orange-500">
          Sign In
        </Link>
        {" · "}
        <Link to={PATHS.REGISTER} className="hover:text-orange-500">
          Register
        </Link>
      </footer>
    </>
  );
}
