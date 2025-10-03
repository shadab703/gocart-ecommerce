import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// Get Dashboard data for admin (total orders,total stores,total product, total revenue)
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({ error: "Not Authorized" }, { status: 401 })
        }
        // Get total orders
        const orders = await prisma.order.count();
        //get total stores on app
        const stores = await prisma.store.count();
        // get all orders include only createdAt and total & calculate total revenue
        const allOrders = await prisma.order.findMany({
            select: {
                createdAt: true,
                total: true
            }
        })
        let totalRevenue = 0;
        allOrders.forEach(order => {
            totalRevenue += order.total;
        })
        const revenue = totalRevenue.toFixed(2);
        // Total Products on app
        const products = await prisma.product.count();
        const dashboardData = {
            orders,
            stores,
            allOrders,
            revenue,
            products
        }
        return NextResponse.json({ dashboardData })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}
