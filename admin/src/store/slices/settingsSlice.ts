import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface IThemeColors {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    info: string;
    success: string;
}

export interface IComponentColors {
    buttonContained: string;
    buttonOutlined: string;
    buttonText: string;
    checkbox: string;
    switch: string;
    select: string;
    chip: string;
    alert: string;
    pagination: string;
    tabs: string;
    badge: string;
    progress: string;
    fab: string;
    slider: string;
}

interface SettingsState {
    themeColors: IThemeColors;
    componentColors?: IComponentColors;
    loading: boolean;
    error: string | null;
}

const initialState: SettingsState = {
    themeColors: {
        primary: '#1976d2',
        secondary: '#9c27b0',
        error: '#d32f2f',
        warning: '#ed6c02',
        info: '#0288d1',
        success: '#2e7d32',
    },
    componentColors: {
        buttonContained: 'primary',
        buttonOutlined: 'primary',
        buttonText: 'primary',
        checkbox: 'primary',
        switch: 'primary',
        select: 'primary',
        chip: 'primary',
        alert: 'primary',
        pagination: 'primary',
        tabs: 'primary',
        badge: 'primary',
        progress: 'primary',
        fab: 'primary',
        slider: 'primary',
    },
    loading: false,
    error: null,
};

// Async thunk to fetch settings
export const fetchSettings = createAsyncThunk(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
        }
    }
);

// Async thunk to update settings
export const updateSettings = createAsyncThunk(
    'settings/updateSettings',
    async (settings: { themeColors?: IThemeColors; componentColors?: IComponentColors }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/settings`,
                settings,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true
                }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setThemeColors: (state, action: PayloadAction<IThemeColors>) => {
            state.themeColors = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.themeColors) {
                    state.themeColors = { ...state.themeColors, ...action.payload.themeColors };
                }
                if (action.payload.componentColors) {
                    state.componentColors = { ...state.componentColors, ...action.payload.componentColors };
                }
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.themeColors) {
                    state.themeColors = { ...state.themeColors, ...action.payload.themeColors };
                }
                if (action.payload.componentColors) {
                    state.componentColors = { ...state.componentColors, ...action.payload.componentColors };
                }
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setThemeColors } = settingsSlice.actions;
export default settingsSlice.reducer;
