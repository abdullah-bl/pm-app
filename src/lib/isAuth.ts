import pb from "@/client"
import type { AstroCookies } from "astro";



export const isAuth = (cookies: AstroCookies) => {
    const cookie = cookies.get("pb_auth") || "";
    if (!cookie) return false;
    pb.authStore.loadFromCookie(`${cookie.value}`);
    return pb.authStore.isValid;
}