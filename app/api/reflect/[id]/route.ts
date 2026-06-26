import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { renderedText } = await req.json();

  if (!renderedText?.trim()) {
    return Response.json({ error: 'Text is required' }, { status: 400 });
  }

  await sql`
    UPDATE reflections
    SET rendered_text = ${renderedText}
    WHERE id = ${id} AND clerk_id = ${userId}
  `;

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await sql`
    DELETE FROM reflections
    WHERE id = ${id} AND clerk_id = ${userId}
  `;

  return Response.json({ ok: true });
}
