import PocketBase from 'pocketbase';
import type { TypedPocketBase } from './types';


const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL!) as TypedPocketBase;

// Optional: disable auto-cancel for SSR environments
pb.autoCancellation(false);


if (typeof window !== 'undefined') {
    pb.authStore.onChange(() => {
        console.log('Auth changed:', pb.authStore.record);
    });

    pb.authStore.loadFromCookie(document.cookie);
}


export default pb;
