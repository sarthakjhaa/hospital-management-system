import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SYMPTOM_SPECIALTY_MAP: Record<string, string[]> = {
  heart: ['Cardiology', 'Interventional Cardiology'],
  chest: ['Cardiology', 'Interventional Cardiology'],
  cardiac: ['Cardiology', 'Interventional Cardiology'],
  bp: ['Cardiology', 'Interventional Cardiology'],
  headache: ['Neurology', 'Neuro-Pathology & Brain Injury'],
  migraine: ['Neurology', 'Neuro-Pathology & Brain Injury'],
  brain: ['Neurology', 'Neuro-Pathology & Brain Injury'],
  numbness: ['Neurology', 'Neuro-Pathology & Brain Injury'],
  child: ['Pediatrics', 'Pediatric Care & Allergy Specialist'],
  kid: ['Pediatrics', 'Pediatric Care & Allergy Specialist'],
  baby: ['Pediatrics', 'Pediatric Care & Allergy Specialist'],
  fever: ['Pediatrics', 'Cardiology', 'Neurology'],
  bone: ['Orthopedics', 'Orthopedic Surgery & Joint Replacement'],
  joint: ['Orthopedics', 'Orthopedic Surgery & Joint Replacement'],
  fracture: ['Orthopedics', 'Orthopedic Surgery & Joint Replacement'],
  knee: ['Orthopedics', 'Orthopedic Surgery & Joint Replacement'],
  back: ['Orthopedics', 'Neurology'],
};

export async function POST(req: NextRequest) {
  try {
    const { symptoms, departmentId, maxFee } = await req.json();

    const allDoctors = await prisma.doctorProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        department: true,
        schedules: true,
      },
    });

    const symptomLower = (symptoms || '').toLowerCase();
    
    // Calculate recommendation score for each doctor
    const scoredDoctors = allDoctors.map((doc) => {
      let score = doc.rating * 10; // Base score out of 50

      // Match Department
      if (departmentId && doc.departmentId === departmentId) {
        score += 30;
      }

      // Match Symptoms
      let symptomMatched = false;
      for (const [key, keywords] of Object.entries(SYMPTOM_SPECIALTY_MAP)) {
        if (symptomLower.includes(key)) {
          if (
            keywords.some(
              (kw) =>
                doc.specialty.toLowerCase().includes(kw.toLowerCase()) ||
                doc.department.name.toLowerCase().includes(kw.toLowerCase())
            )
          ) {
            score += 40;
            symptomMatched = true;
          }
        }
      }

      // Match fee limit if provided
      if (maxFee && doc.consultationFee <= maxFee) {
        score += 10;
      }

      return {
        doctor: doc,
        score,
        symptomMatched,
      };
    });

    // Sort by recommendation score descending
    scoredDoctors.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      recommendations: scoredDoctors.map((item) => ({
        ...item.doctor,
        matchScore: Math.min(Math.round(item.score), 100),
        symptomMatched: item.symptomMatched,
      })),
    });
  } catch (error) {
    console.error('Doctor recommendation error:', error);
    return NextResponse.json({ error: 'Failed to generate doctor recommendations' }, { status: 500 });
  }
}
