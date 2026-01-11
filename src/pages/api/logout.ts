import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
    // Clear the auth cookie
    cookies.delete('pb_auth', {
        path: '/',
    });

    return new Response(JSON.stringify({
        success: true,
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
};
