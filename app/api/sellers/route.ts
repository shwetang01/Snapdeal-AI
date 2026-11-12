// app/api/sellers/route.ts
// REST API to fetch sellers, seller metrics, products, and business insights

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSellers,
  getSellerById,
  getSellerProducts,
  getSellerAnalytics,
  computeSellerDeltas,
} from '@/lib/seller-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('id');
    const type = searchParams.get('type'); // 'products' | 'analytics' | 'metrics' | undefined (all)

    // If no sellerId provided, return full list of all 10 sellers summary
    if (!sellerId) {
      const sellers = getAllSellers();
      return NextResponse.json({
        total: sellers.length,
        sellers,
      });
    }

    const seller = getSellerById(sellerId);
    if (!seller) {
      return NextResponse.json(
        {
          error: `Seller '${sellerId}' not found. Available seller IDs: SD001 to SD010.`,
        },
        { status: 404 }
      );
    }

    // Specific sub-resource requests
    if (type === 'products') {
      const products = getSellerProducts(sellerId);
      return NextResponse.json({
        sellerId: seller.sellerId,
        store: seller.store,
        totalProducts: products.length,
        products,
      });
    }

    if (type === 'analytics' || type === 'insights') {
      const analytics = getSellerAnalytics(sellerId);
      return NextResponse.json(analytics);
    }

    if (type === 'metrics') {
      const deltas = computeSellerDeltas(seller);
      return NextResponse.json({
        sellerId: seller.sellerId,
        lastMonth: seller.lastMonth,
        thisMonth: seller.thisMonth,
        deltas,
      });
    }

    // Default: return complete seller dossier including profile, metrics, products, and analytics
    const analytics = getSellerAnalytics(sellerId);
    const deltas = computeSellerDeltas(seller);

    return NextResponse.json({
      seller,
      deltas,
      analytics,
    });
  } catch (error: any) {
    console.error('[API /api/sellers error]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve seller data' },
      { status: 500 }
    );
  }
}
