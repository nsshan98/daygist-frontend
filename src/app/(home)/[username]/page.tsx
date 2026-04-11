import { ProfileContent } from "@/components/features/profile/components/profile-content";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const { username } = await params;
  const { id } = await searchParams;
  return <ProfileContent username={username} userId={id} />;
}
