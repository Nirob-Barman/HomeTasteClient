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
  Star,
  Users,
  Award,
} from "lucide-react";
import { PATHS } from "@/routes/paths";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAppSelector } from "@/app/hooks";
import { USER_ROLES } from "@/constants/roles";
import { useGetMealsQuery } from "@/features/meals/mealsApi";
import { Skeleton } from "@/components/ui/Skeleton";

function dashboardPath(roles: string[]) {
  if (roles.includes(USER_ROLES.ADMIN)) return PATHS.ADMIN.DASHBOARD;
  if (roles.includes(USER_ROLES.DELIVERY_PERSONNEL)) return PATHS.DELIVERY.DASHBOARD;
  return PATHS.CUSTOMER.DASHBOARD;
}

const stats = [
  { icon: ShoppingBag, value: "500+", label: "Meals Delivered" },
  { icon: Users, value: "200+", label: "Happy Customers" },
  { icon: Star, value: "4.8★", label: "Average Rating" },
  { icon: Award, value: "100%", label: "Fresh Ingredients" },
];

const testimonials = [
  {
    name: "Sarah M.",
    rating: 5,
    text: "Honestly the best food delivery I've ever tried. Tastes exactly like homemade — because it is!",
  },
  {
    name: "James K.",
    rating: 5,
    text: "Fast delivery, generous portions, and the loyalty points add up quickly. Highly recommend.",
  },
  {
    name: "Priya R.",
    rating: 5,
    text: "I order at least three times a week. The variety is great and every meal is consistently delicious.",
  },
];

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
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const { data: mealsData, isLoading: loadingMeals } = useGetMealsQuery({ pageNumber: 1, pageSize: 6 });
  const featuredMeals = mealsData?.data?.data ?? [];

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
          {isAuthenticated ? (
            <Link
              to={dashboardPath(user?.roles ?? [])}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-100 bg-white px-6 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <Icon size={20} className="text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
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

      {/* Featured Meals */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Featured Meals</h2>
              <p className="mt-1 text-sm text-gray-500">Fresh picks from today's menu</p>
            </div>
            <Link
              to={PATHS.LOGIN}
              className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loadingMeals ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : featuredMeals.length === 0 ? (
            <p className="text-center text-sm text-gray-400">No meals available right now.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredMeals.map((meal) => (
                <Link
                  key={meal.id}
                  to={PATHS.LOGIN}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-orange-50">
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name ?? ""}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">🍽️</div>
                    )}
                    {meal.categoryName && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-orange-600 shadow-sm">
                        {meal.categoryName}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-800 truncate">{meal.name ?? "—"}</p>
                    {meal.description && (
                      <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{meal.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base font-bold text-orange-500">${meal.price.toFixed(2)}</span>
                      <span className="rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white group-hover:bg-orange-600 transition-colors">
                        Order Now
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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

      {/* Testimonials */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-800">What Our Customers Say</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {testimonials.map(({ name, rating, text }) => (
              <div key={name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">"{text}"</p>
                <p className="mt-4 text-xs font-semibold text-gray-400">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-6 mb-20 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-14 text-center shadow-lg sm:mx-auto sm:max-w-4xl">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to eat well?</h2>
        <p className="mt-2 text-sm text-orange-100">
          Join hundreds of happy customers enjoying fresh home-cooked meals every day.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              to={dashboardPath(user?.roles ?? [])}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-orange-500 hover:bg-orange-50 transition-colors"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to={PATHS.REGISTER}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-orange-500 hover:bg-orange-50 transition-colors"
              >
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link
                to={PATHS.LOGIN}
                className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>
    </>
  );
}
