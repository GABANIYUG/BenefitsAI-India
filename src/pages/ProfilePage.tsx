import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfiles, createProfile, updateProfile } from "../services/profile.service";
import { useAuth } from "../contexts/AuthContext";

const profileSchema = z.object({
  age: z.union([z.number().min(1, "Age must be positive"), z.nan()]).optional().transform(v => isNaN(v as number) ? undefined : v),
  state: z.string().optional(),
  income: z.union([z.number().min(0, "Income must be positive"), z.nan()]).optional().transform(v => isNaN(v as number) ? undefined : v),
  is_student: z.boolean().optional(),
  is_farmer: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfiles(token),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const profile = profilesData?.data?.[0];

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile || {
      age: undefined,
      state: '',
      income: undefined,
      is_student: false,
      is_farmer: false
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      if (profile?.id) {
        return updateProfile(profile.id, data, token);
      }
      return createProfile(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      alert('Profile updated successfully!');
    },
    onError: (error: any) => {
      alert(`Failed to save profile: ${error.message}`);
      console.error(error);
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="py-8 max-w-2xl mx-auto w-full animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-40 bg-surface-container-high rounded-xl"></div>
          <div className="h-10 w-28 bg-surface-container-high rounded-xl"></div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><div className="h-4 w-12 bg-surface-container-highest rounded mb-2"></div><div className="h-6 w-20 bg-surface-container-high rounded"></div></div>
            <div><div className="h-4 w-12 bg-surface-container-highest rounded mb-2"></div><div className="h-6 w-32 bg-surface-container-high rounded"></div></div>
            <div className="md:col-span-2"><div className="h-4 w-32 bg-surface-container-highest rounded mb-2"></div><div className="h-6 w-40 bg-surface-container-high rounded"></div></div>
          </div>
          <div className="pt-4 border-t border-outline-variant/10">
            <div className="h-5 w-24 bg-surface-container-highest rounded mb-4"></div>
            <div className="flex gap-4">
              <div className="h-8 w-24 bg-surface-container-high rounded-full"></div>
              <div className="h-8 w-24 bg-surface-container-high rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentValues = profile || {};

  return (
    <div className="py-8 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display-lg font-bold text-on-surface">My Profile</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isEditing ? 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest' : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container glow-button shadow-[0_0_15px_rgba(176,198,255,0.4)]'}`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10">
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1">Age</p>
                <p className="text-lg font-bold text-on-surface">{currentValues.age || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1">State</p>
                <p className="text-lg font-bold text-on-surface">{currentValues.state || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-on-surface-variant mb-1">Annual Income (₹)</p>
                <p className="text-lg font-bold text-on-surface">{currentValues.income ? `₹${currentValues.income.toLocaleString()}` : 'Not provided'}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-outline-variant/10">
              <h3 className="font-medium text-on-surface mb-3">Categories</h3>
              <div className="flex gap-4">
                {currentValues.is_student && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">Student</span>
                )}
                {currentValues.is_farmer && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">Farmer</span>
                )}
                {!currentValues.is_student && !currentValues.is_farmer && (
                  <span className="text-on-surface-variant text-sm">No special categories selected.</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Age</label>
                <input 
                  type="number" 
                  {...register("age", { valueAsNumber: true })}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">State</label>
                <input 
                  type="text" 
                  {...register("state")}
                  placeholder="e.g. Maharashtra"
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-on-surface mb-2">Annual Income (₹)</label>
                <input 
                  type="number" 
                  {...register("income", { valueAsNumber: true })}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary"
                />
                {errors.income && <p className="text-red-400 text-xs mt-1">{errors.income.message}</p>}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-outline-variant/10">
              <h3 className="font-medium text-on-surface">Categories</h3>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-surface-container-highest transition-colors">
                <input type="checkbox" {...register("is_student")} className="w-5 h-5 accent-primary" />
                <span className="text-on-surface">I am a Student</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-surface-container-highest transition-colors">
                <input type="checkbox" {...register("is_farmer")} className="w-5 h-5 accent-primary" />
                <span className="text-on-surface">I am a Farmer</span>
              </label>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full glow-button bg-primary text-on-primary py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(176,198,255,0.4)] hover:shadow-[0_0_25px_rgba(176,198,255,0.6)] disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
