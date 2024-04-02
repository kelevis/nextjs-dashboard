import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    //page属性指定了特定页面的配置。指定 signIn 页面的路径为 /login
    pages: {
        signIn: '/login',
    },

    //callback,  authorized用于验证请求是否有权通过Middleware访问页面
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                //无需验证，直接访问
                return true
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },

    // Add providers with an empty array for now; providers选项是一个数组，可以在其中列出不同的登录选项。
    providers: [],


};
