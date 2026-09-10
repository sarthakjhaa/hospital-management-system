import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId: session.id, isRead: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (notificationId) {
      // IDOR Guard: Verify notification belongs to user
      const existing = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!existing || existing.userId !== session.id) {
        return NextResponse.json({ error: 'Notification not found or access denied' }, { status: 403 });
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({ message: 'Notification marked as read', notification: updated });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
