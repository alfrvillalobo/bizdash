import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Por ahora dejamos que la protección la maneje
// el layout del dashboard (client-side con useAuth)
export function middleware(request: NextRequest) {
  return NextResponse.next();
}