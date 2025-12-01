
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: organizationId } = await params;
    
const organization = await prisma.organization.findFirst({
  where: {
    id: organizationId,
    members: {
      some: {
        userId: session.user.id
      }
    }
  }
});

if (!organization) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

const outlines = await prisma.outline.findMany({
  where: {
    organizationId: organizationId
  },
  orderBy: {
    createdAt: 'desc'
  }
});

    if (!organization) {
      return NextResponse.json({ error: "Organization not found or access denied" }, { status: 404 });
    }

    const outlinesData = outlines.map(outline => ({
      id: outline.id,
      header: outline.header,
      type: outline.sectionType,
      status: outline.status,
      target: outline.target.toString(),
      limit: outline.limit.toString(),
      reviewer: outline.reviewer,
      createdAt: outline.createdAt.toISOString(),
      updatedAt: outline.updatedAt.toISOString()
    }));

    return NextResponse.json({ outlines:outlinesData });
  } catch (error) {
    console.error("Error fetching outlines:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
 request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

     const { id: organizationId } = await params;
    const body = await request.json();
    const { header, sectionType, status, target, limit, reviewer } = body;

    
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      }
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found or access denied" }, { status: 404 });
    }

    const newOutline = await prisma.outline.create({
      data: {
        header,
        sectionType,
        status,
        target: parseInt(target),
        limit: parseInt(limit),
        reviewer,
        organizationId: organizationId,
      },
    });

    return NextResponse.json({
      outline: {
        id: newOutline.id,
        header: newOutline.header,
        type: newOutline.sectionType,
        status: newOutline.status,
        target: newOutline.target.toString(),
        limit: newOutline.limit.toString(),
        reviewer: newOutline.reviewer,
        createdAt: newOutline.createdAt.toISOString(),
        updatedAt: newOutline.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error creating outline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}