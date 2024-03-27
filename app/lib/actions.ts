'use server';

import {z} from 'zod';
import {sql} from '@vercel/postgres';
import { revalidatePath } from 'next/cache';  // 更新路由中数据
import { redirect } from 'next/navigation';   //重定向回到invoices页面

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});

export async function createInvoice(formData: FormData) {
    // const { customerId, amount, status } = CreateInvoice.parse({
    // const rawFormData = {
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // Test it out:
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // console.log(rawFormData);
    // console.log("typeof rawFormData.amount:",typeof rawFormData.amount);

    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    console.log("insert Data, customerId, amountInCents, status, date:", customerId, amountInCents, status, date);

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');


}

export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}