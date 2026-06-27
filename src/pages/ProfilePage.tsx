import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfiles, createProfile } from "../services/profile.service";
import { useAuth } from "../contexts/AuthContext";

const profileSchema = z.object({
  age: z.number({ message: "Age must be a number" }).min(1, "Age must be positive").optional(),
  state: z.string().min(2, "State is required").optional(),
  income: z.number({ message: "Income must be a number" }).min(0).optional(),
  isStudent: z.boolean().optional(),
  isFarmer: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfiles(token)
  });

  const profile = profilesData?.data?.[0];

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile || {
      age: undefined,
      state: '',
      income: undefined,
      isStudent: false,
      isFarmer: false
    }
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => createProfile(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert('Profile updated successfully!');
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="py-8 max-w-2xl mx-auto w-full">
      <h2 className="text-3xl font-display-lg font-bold text-on-surface mb-8">My Profile</h2>
      
      <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10">
        <p className="text-on-surface-variant mb-6 text-sm">
          Complete your profile to get personalized scheme recommendations and eligibility checks.
        </p>

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
              <input type="checkbox" {...register("isStudent")} className="w-5 h-5 accent-primary" />
              <span className="text-on-surface">I am a Student</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-surface-container-highest transition-colors">
              <input type="checkbox" {...register("isFarmer")} className="w-5 h-5 accent-primary" />
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
      </div>
    </div>
  )
}
