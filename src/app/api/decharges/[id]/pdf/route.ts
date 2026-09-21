import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderDechargePDFToBuffer } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const isInline = searchParams.get('inline') === 'true';

    const decharge = await prisma.equipmentDecharge.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!decharge) {
      return NextResponse.json({ error: 'Bon de décharge introuvable.' }, { status: 404 });
    }

    const pdfBuffer = await renderDechargePDFToBuffer(decharge);
    const filename = `Bon_Decharge_${decharge.dechargeNumber}.pdf`;
    const dispositionType = isInline ? 'inline' : 'attachment';

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionType}; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating Décharge PDF download:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du document de décharge.' },
      { status: 500 }
    );
  }
}
