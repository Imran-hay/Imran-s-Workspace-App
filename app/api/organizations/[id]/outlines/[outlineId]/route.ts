import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma"

export async function PUT(
   request: NextRequest,
  { params }: { params: Promise<{ id: string; outlineId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


      const { id: organizationId, outlineId } = await params;
    const body = await request.json();
    const { header, sectionType, status, target, limit, reviewer } = body;

const member = await prisma.member.findFirst({
  where: {
    userId: session.user.id,
    organizationId: organizationId
  }
});

if (!member) {
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}


const outline = await prisma.outline.findUnique({
  where: { id: outlineId }
});

if (!outline) {
  return NextResponse.json({ error: "Outline not found" }, { status: 404 });
}

const updateData: any = {};
if (header !== undefined) updateData.header = header;
if (sectionType !== undefined) updateData.sectionType = sectionType;
if (status !== undefined) updateData.status = status;
if (target !== undefined) updateData.target = parseInt(target);
if (limit !== undefined) updateData.limit = parseInt(limit);
if (reviewer !== undefined) updateData.reviewer = reviewer;

const updatedOutline = await prisma.outline.update({
  where: { id: outlineId },
  data: updateData
});

    return NextResponse.json({
      outline: {
        id: updatedOutline.id,
        header: updatedOutline.header,
        type: updatedOutline.sectionType,
        status: updatedOutline.status,
        target: updatedOutline.target.toString(),
        limit: updatedOutline.limit.toString(),
        reviewer: updatedOutline.reviewer,
        createdAt: updatedOutline.createdAt.toISOString(),
        updatedAt: updatedOutline.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error updating outline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; outlineId: string }> } 
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

      const { id: organizationId, outlineId } = await params;


const member = await prisma.member.findFirst({
  where: {
    userId: session.user.id,
    organizationId: organizationId
  }
});

if (!member) {
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}


const outline = await prisma.outline.findUnique({
  where: { id: outlineId }
});

if (!outline) {
  return NextResponse.json({ error: "Outline not found" }, { status: 404 });
}

    await prisma.outline.delete({
      where: { id: outlineId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting outline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}