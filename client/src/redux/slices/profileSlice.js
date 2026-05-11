import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    company: 'Tech Solutions Inc.',
    location: 'New York, USA',
    phone: '+1 (555) 123-4567',
    bio: 'Experienced administrator with a passion for efficient inventory management.',
    avatar: null,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      github: 'https://github.com/johndoe'
    }
  },
  loading: false,
  error: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updateSocialLinks: (state, action) => {
      state.profile.socialLinks = { ...state.profile.socialLinks, ...action.payload };
    },
    updateAvatar: (state, action) => {
      state.profile.avatar = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  updateProfile,
  updateSocialLinks,
  updateAvatar,
  setLoading,
  setError
} = profileSlice.actions;

export default profileSlice.reducer; 