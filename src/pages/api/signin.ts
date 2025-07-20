// import type { APIRoute } from 'astro';
// import { auth } from '../../firebase/server';

// export const prerender = false;

// export const POST: APIRoute = async ({ request, cookies }) => {
//     const authHeader = request.headers.get('Authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return new Response("Missing token", { status: 401 });
//     }
//     const idToken = authHeader.split('Bearer ')[1];

//     try {

//         const decodedToken = await auth.verifyIdToken(idToken);
//         const authTime = decodedToken.auth_time * 1000;
//         const fiveMinutesAgo = Date.now() - (0.25 * 60 * 1000);
//         if (authTime < fiveMinutesAgo) {
//             return new Response("Recent sign-in required.", { status: 401 });
//         }

//         const fiveDaysInSeconds = 60 * 60 * 24 * 5;
//         const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: fiveDaysInSeconds * 1000 });

//         cookies.set('__session', sessionCookie, {
//             path: '/',
//             httpOnly: true,
//             secure: import.meta.env.PROD,
//             maxAge: fiveDaysInSeconds,
//             sameSite: 'lax',
//         });

//         return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
//     } catch (error) {
//         return new Response("Failed to create session", { status: 401 });
//     }
// };