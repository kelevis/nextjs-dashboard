import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    // matcher 指定它应该在特定路径上运行。在中间件验证身份验证之前，受保护的路由,不会开始渲染，从而增强应用程序的安全性和性能。
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};