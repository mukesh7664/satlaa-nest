"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useMemo } from "react";
import { fetchSettings } from "@/store/slices/settingsSlice";
import defaultTheme from "@/theme";

export default function ThemeWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useAppDispatch();
    const { themeColors, componentColors } = useAppSelector(
        (state) => state.settings
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            dispatch(fetchSettings());
        }
    }, [dispatch]);

    // Inject CSS variables for global consistency (Tailwind/Standard CSS support)
    useEffect(() => {
        if (themeColors) {
            const root = document.documentElement;
            Object.entries(themeColors).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value as string);
                // Also set specific variables often used by Tailwind/shadcn if needed
                if (key === 'primary') root.style.setProperty('--primary', value as string);
            });
        }
    }, [themeColors]);

    const getColor = (colorKey: string | undefined): string | undefined => {
        if (!colorKey) return undefined;
        // check if it maps to a theme color
        // Use type assertion to access dynamic keys
        if (themeColors && colorKey in themeColors) {
            return (themeColors as any)[colorKey];
        }
        return colorKey;
    };

    const theme = useMemo(() => {
        const selectColor = getColor(componentColors?.select) || themeColors.primary || '#3b82f6';
        return createTheme({
            ...defaultTheme,
            palette: {
                ...defaultTheme.palette,
                primary: { main: themeColors.primary || '#1976d2' },
                secondary: { main: themeColors.secondary || '#9c27b0' },
                error: { main: themeColors.error || '#d32f2f' },
                warning: { main: themeColors.warning || '#ed6c02' },
                info: { main: themeColors.info || '#0288d1' },
                success: { main: themeColors.success || '#2e7d32' },
            },
            // Apply component overrides
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            paddingTop: '6px',
                            paddingBottom: '6px',
                            paddingLeft: '14px',
                            paddingRight: '14px',
                            fontSize: '0.8125rem',
                            lineHeight: 1.5,
                            minHeight: '34px',
                            '@media (min-width: 1280px)': {
                                paddingTop: '7px',
                                paddingBottom: '7px',
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                fontSize: '0.875rem',
                                minHeight: '36px',
                            },
                        },
                        sizeSmall: {
                            borderRadius: '6px',
                            paddingTop: '3px',
                            paddingBottom: '3px',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                            fontSize: '0.75rem',
                            minHeight: '28px',
                            '@media (min-width: 1280px)': {
                                paddingTop: '4px',
                                paddingBottom: '4px',
                                minHeight: '30px',
                            },
                        },
                        sizeLarge: {
                            borderRadius: '10px',
                            paddingTop: '9px',
                            paddingBottom: '9px',
                            fontSize: '0.9375rem',
                            minHeight: '42px',
                            '@media (min-width: 1280px)': {
                                paddingTop: '10px',
                                paddingBottom: '10px',
                                minHeight: '44px',
                            },
                        },
                        containedPrimary: {
                            ...(!!componentColors?.buttonContained && {
                                backgroundColor: `${getColor(componentColors.buttonContained)} !important`,
                                "&:hover": {
                                    backgroundColor: `${getColor(componentColors.buttonContained)} !important`,
                                    filter: "brightness(0.9)",
                                },
                            }),
                        },
                        outlinedPrimary: {
                            ...(!!componentColors?.buttonOutlined && {
                                borderColor: `${getColor(componentColors.buttonOutlined)} !important`,
                                color: `${getColor(componentColors.buttonOutlined)} !important`,
                            }),
                        },
                        textPrimary: {
                            ...(!!componentColors?.buttonText && {
                                color: `${getColor(componentColors.buttonText)} !important`,
                            }),
                        },
                    },
                },
                MuiCheckbox: {
                    styleOverrides: {
                        colorPrimary: {
                            ...(!!componentColors?.checkbox && {
                                color: `${getColor(componentColors.checkbox)} !important`,
                                "&.Mui-checked": {
                                    color: `${getColor(componentColors.checkbox)} !important`,
                                },
                            }),
                        },
                    },
                },
                MuiSwitch: {
                    styleOverrides: {
                        colorPrimary: {
                            ...(!!componentColors?.switch && {
                                "&.Mui-checked": {
                                    color: `${getColor(componentColors.switch)} !important`,
                                    "& + .MuiSwitch-track": {
                                        backgroundColor: `${getColor(componentColors.switch)} !important`,
                                    },
                                },
                            }),
                        },
                    },
                },
                MuiInputLabel: {
                    styleOverrides: {
                        root: {
                            ...(!!componentColors?.select && {
                                "&.Mui-focused": {
                                    color: `${getColor(componentColors.select)} !important`,
                                }
                            })
                        }
                    }
                },
                MuiOutlinedInput: {
                    styleOverrides: {
                        root: {
                            borderRadius: '8px !important',
                            backgroundColor: '#f8fafc !important',
                            transition: 'all 0.2s ease !important',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e2e8f0 !important',
                                transition: 'all 0.2s ease !important',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#cbd5e1 !important',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: `${selectColor} !important`,
                                borderWidth: '1.5px !important',
                            }
                        }
                    }
                },
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            '&.MuiMenu-paper': {
                                borderRadius: '8px !important',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08) !important',
                                border: '1px solid #e2e8f0 !important',
                                marginTop: '4px !important',
                            },
                            '&.MuiAutocomplete-paper': {
                                borderRadius: '8px !important',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08) !important',
                                border: '1px solid #e2e8f0 !important',
                                marginTop: '4px !important',
                            }
                        }
                    }
                },
                MuiMenuItem: {
                    styleOverrides: {
                        root: {
                            padding: '8px 16px !important',
                            fontSize: '0.8125rem !important',
                            fontWeight: '600 !important',
                            color: '#475569 !important',
                            transition: 'all 0.15s ease !important',
                            '&:hover': {
                                backgroundColor: '#f1f5f9 !important',
                            },
                            '&.Mui-selected': {
                                backgroundColor: `color-mix(in srgb, ${selectColor} 8%, transparent) !important`,
                                color: `${selectColor} !important`,
                                '&:hover': {
                                    backgroundColor: `color-mix(in srgb, ${selectColor} 12%, transparent) !important`,
                                }
                            }
                        }
                    }
                },
                MuiAutocomplete: {
                    styleOverrides: {
                        option: {
                            padding: '8px 16px !important',
                            fontSize: '0.8125rem !important',
                            transition: 'all 0.15s ease !important',
                            '&[aria-selected="true"]': {
                                backgroundColor: `color-mix(in srgb, ${selectColor} 8%, transparent) !important`,
                                color: `${selectColor} !important`,
                            },
                            '&:hover': {
                                backgroundColor: '#f1f5f9 !important',
                            }
                        }
                    }
                },
                MuiSelect: {
                    styleOverrides: {
                        // Kept for specific select styles if needed, but border/label handled above
                    }
                },
                MuiFab: {
                    styleOverrides: {
                        primary: {
                            ...(!!componentColors?.fab && {
                                backgroundColor: `${getColor(componentColors.fab)} !important`,
                                "&:hover": {
                                    backgroundColor: `${getColor(componentColors.fab)} !important`,
                                    filter: "brightness(0.9)",
                                },
                            }),
                        },
                    },
                },
                // MuiChip removed
                // MuiAlert removed
                // MuiBadge removed
                // MuiAlert removed
                MuiPagination: {
                    styleOverrides: {
                        text: {
                            ...(!!componentColors?.pagination && {
                                "& .Mui-selected": {
                                    backgroundColor: `${getColor(componentColors.pagination)} !important`,
                                    color: "#fff !important",
                                    "&:hover": {
                                        backgroundColor: `${getColor(componentColors.pagination)} !important`,
                                        filter: "brightness(0.9)",
                                    }
                                }
                            }),
                        },
                        outlined: {
                            ...(!!componentColors?.pagination && {
                                "& .Mui-selected": {
                                    borderColor: `${getColor(componentColors.pagination)} !important`,
                                    backgroundColor: `${getColor(componentColors.pagination)} !important`, // focused/selected usually filled
                                    color: "#fff !important",
                                }
                            })
                        }
                    },
                },
                MuiTabs: {
                    styleOverrides: {
                        indicator: {
                            ...(!!componentColors?.tabs && {
                                backgroundColor: `${getColor(componentColors.tabs)} !important`,
                            }),
                        },
                    },
                },
                MuiTab: {
                    styleOverrides: {
                        root: {
                            ...(!!componentColors?.tabs && {
                                "&.Mui-selected": {
                                    color: `${getColor(componentColors.tabs)} !important`,
                                },
                            }),
                        },
                    },
                },
                // MuiBadge removed
                MuiCircularProgress: {
                    styleOverrides: {
                        colorPrimary: {
                            ...(!!componentColors?.progress && {
                                color: `${getColor(componentColors.progress)} !important`,
                            }),
                        },
                    },
                },
                MuiLinearProgress: {
                    styleOverrides: {
                        colorPrimary: {
                            ...(!!componentColors?.progress && {
                                backgroundColor: `${getColor(componentColors.progress)} !important`, // Bar bg (usually lighter)
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: `${getColor(componentColors.progress)} !important`, // Actual progress bar
                                    filter: "brightness(0.8)", // Make bar slightly distinct
                                }
                            }),
                        },
                        barColorPrimary: { // Specific override if needed
                            ...(!!componentColors?.progress && {
                                backgroundColor: `${getColor(componentColors.progress)} !important`,
                            }),
                        }
                    },
                },
                MuiSlider: {
                    styleOverrides: {
                        colorPrimary: {
                            ...(!!componentColors?.slider && {
                                color: `${getColor(componentColors.slider)} !important`,
                            }),
                        },
                    },
                },
            },
        });
    }, [themeColors, componentColors]);

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
