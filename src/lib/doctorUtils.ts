export interface DoctorMetadata {
  country: string;
  state: string;
  district: string;
  city: string;
  hospital: string;
  languages: string[];
  experience: number;
  bioText: string;
}

export function parseDoctorBio(bio: string | null | undefined): DoctorMetadata {
  const defaultMeta: DoctorMetadata = {
    country: 'India',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    city: 'Mumbai',
    hospital: 'Apollo Super Speciality Hospital',
    languages: ['Hindi', 'English', 'Marathi'],
    experience: 8,
    bioText: bio || 'Experienced medical practitioner providing comprehensive healthcare services.',
  };

  if (!bio) return defaultMeta;

  try {
    if (bio.trim().startsWith('{')) {
      const parsed = JSON.parse(bio);
      return {
        country: parsed.country || parsed.location?.country || 'India',
        state: parsed.state || parsed.location?.state || 'Maharashtra',
        district: parsed.district || parsed.location?.district || 'Mumbai Suburban',
        city: parsed.city || parsed.location?.city || 'Mumbai',
        hospital: parsed.hospital || 'District Memorial Hospital',
        languages: Array.isArray(parsed.languages) && parsed.languages.length > 0 ? parsed.languages : ['Hindi', 'English'],
        experience: typeof parsed.experience === 'number' ? parsed.experience : 8,
        bioText: parsed.bioText || parsed.summary || bio,
      };
    }
  } catch (e) {
    // If not JSON, use string as bioText
  }

  return {
    ...defaultMeta,
    bioText: bio,
  };
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDoctorName(name: string | null | undefined): string {
  if (!name) return 'Dr. Medical Practitioner';
  const cleanName = name.trim();
  if (cleanName.toLowerCase().startsWith('dr.')) {
    return cleanName;
  }
  return `Dr. ${cleanName}`;
}
