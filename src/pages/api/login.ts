import type { APIRoute } from 'astro';
import pb from '@/client';

export const POST: APIRoute = async ({ request, cookies }) => {
    const data = await request.json() as { email: string; password: string };

    try {
        const authData = await pb
            .collection('users')
            .authWithPassword(data.email, data.password);


        cookies.set('pb_auth', pb.authStore.exportToCookie(), {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: import.meta.env.PROD,
        });

        return new Response(JSON.stringify({
            success: true,
            user: authData.record
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Invalid email or password'
        }), {
            status: 401,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
};
