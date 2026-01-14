import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        E-commerce Dashboard
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Welcome to your e-commerce dashboard! Here you can find an overview of
        your store's performance, including sales metrics, customer demographics,
        and recent orders.
      </p>
    </div>
    // <div className="grid grid-cols-12 gap-4 md:gap-6">
    //   <div className="col-span-12 space-y-6 xl:col-span-7">
    //     <EcommerceMetrics />

    //     <MonthlySalesChart />
    //   </div>

    //   <div className="col-span-12 xl:col-span-5">
    //     <MonthlyTarget />
    //   </div>

    //   <div className="col-span-12">
    //     <StatisticsChart />
    //   </div>

    //   <div className="col-span-12 xl:col-span-5">
    //     <DemographicCard />
    //   </div>

    //   <div className="col-span-12 xl:col-span-7">
    //     <RecentOrders />
    //   </div>
    // </div>
  );
}
