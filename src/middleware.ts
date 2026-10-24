import { withAuth } from "next-auth/middleware";

// Any signed-in user may enter /dashboard and /admin; role checks for the
// admin console happen in its layout so students are redirected, not bounced to login.
export default withAuth({ pages: { signIn: "/login" } });

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
