"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Separator } from "@/components/atoms/separator";
import { 
  Heart, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  GraduationCap,
  Briefcase,
  Home,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react";

interface UserProfile {
  _id: string;
  bio?: string | null;
  about?: string | null;
  birthDate?: string | null;
  age?: number | null;
  relationship?: string | null;
  address?: {
    fullAddress?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zip?: string | null;
  };
  contact?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
  };
  education?: Array<{
    school: string;
    degree?: string;
    field?: string;
    startYear?: string;
    endYear?: string;
  }>;
  createdAt: string;
  role?: string;
}

interface ProfileInfoProps {
  profile: UserProfile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const getRelationshipLabel = (status?: string | null) => {
    const labels: Record<string, string> = {
      SINGLE: "Single",
      IN_RELATIONSHIP: "In a relationship",
      MARRIED: "Married",
      DIVORCED: "Divorced",
      WIDOWED: "Widowed",
    };
    return status ? labels[status] : null;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderEducationItem = (edu: any, index: number) => (
    <div key={index} className="flex items-start gap-3">
      <GraduationCap className="w-5 h-5 text-muted-foreground mt-0.5" />
      <div>
        <p className="font-medium">{edu.school}</p>
        {(edu.degree || edu.field) && (
          <p className="text-sm text-muted-foreground">
            {[edu.degree, edu.field].filter(Boolean).join(' in ')}
          </p>
        )}
        {(edu.startYear || edu.endYear) && (
          <p className="text-xs text-muted-foreground">
            {edu.startYear} - {edu.endYear || 'Present'}
          </p>
        )}
      </div>
    </div>
  );

  const hasContactInfo = profile.contact && (
    profile.contact.phone || 
    profile.contact.email || 
    profile.contact.website ||
    profile.contact.facebook ||
    profile.contact.instagram ||
    profile.contact.linkedin
  );

  const hasAboutInfo = profile.bio || profile.about;
  const hasPersonalInfo = profile.birthDate || profile.age || profile.relationship;
  const hasLocationInfo = profile.address?.fullAddress || profile.address?.city || profile.address?.country;
  const hasEducation = profile.education && profile.education.length > 0;
  const hasRole = profile.role;
  return (
    <div className="space-y-6">
      {/* Role Badge */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-linear-to-r from-primary to-secondary p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Account Type</p>
                <h3 className="text-2xl font-bold mt-1 capitalize">
                  {profile.role ? profile.role.toLowerCase().replace('_', ' ') : 'N/A'}
                </h3>
              </div>
              <Briefcase className="w-12 h-12 opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            About
          </h3>
          <Separator />
          
          {profile.bio ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
              <p className="text-base">{profile.bio}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
              <p className="text-base text-muted-foreground">N/A</p>
            </div>
          )}
          
          {profile.about ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">About</p>
              <p className="text-base">{profile.about}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">About</p>
              <p className="text-base text-muted-foreground">N/A</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Born:</span>
              <span>{profile.birthDate ? formatDate(profile.birthDate) : 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Age:</span>
              <span>{profile.age ? `${profile.age} years old` : 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Relationship:</span>
              <span>{getRelationshipLabel(profile.relationship) || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Address */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Location
          </h3>
          <Separator />
          
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{profile.address?.fullAddress || 'N/A'}</span>
            </p>
            
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>
                {[profile.address?.city, profile.address?.state, profile.address?.country]
                  .filter(Boolean)
                  .join(', ') || 'N/A'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Contact Information
          </h3>
          <Separator />
          
          <div className="space-y-3">
            {profile.contact?.phone ? (
              <a 
                href={`tel:${profile.contact.phone}`}
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{profile.contact.phone}</span>
              </a>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>N/A</span>
              </div>
            )}
            
            {profile.contact?.email ? (
              <a 
                href={`mailto:${profile.contact.email}`}
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{profile.contact.email}</span>
              </a>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>N/A</span>
              </div>
            )}
            
            {profile.contact?.website ? (
              <a 
                href={profile.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              >
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{profile.contact.website}</span>
              </a>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>N/A</span>
              </div>
            )}
            
            {profile.contact?.facebook ? (
              <a 
                href={profile.contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              >
                <Facebook className="w-4 h-4 text-muted-foreground" />
                <span>Facebook</span>
              </a>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Facebook className="w-4 h-4 text-muted-foreground" />
                <span>N/A</span>
              </div>
            )}
            
            {profile.contact?.instagram ? (
              <a 
                href={profile.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4 text-muted-foreground" />
                <span>Instagram</span>
              </a>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Instagram className="w-4 h-4 text-muted-foreground" />
                <span>N/A</span>
              </div>
            )}
            
            {profile.contact?.linkedin ? (
              <a 
                href={profile.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              >
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                <span>LinkedIn</span>
              </a>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                <span>N/A</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Education
          </h3>
          <Separator />
          
          <div className="space-y-4">
            {profile.education && profile.education.length > 0 ? (
              profile.education.map((edu, index) => renderEducationItem(edu, index))
            ) : (
              <p className="text-sm text-muted-foreground">No education information added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
