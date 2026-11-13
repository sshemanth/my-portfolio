/** Prefix a file in `public/` with the deploy base path (empty on Vercel / root domains). */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${path.replace(/^\//, "")}`;
