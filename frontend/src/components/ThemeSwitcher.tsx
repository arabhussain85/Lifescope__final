import React from 'react';
import { IconButton, useTheme, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useColorMode } from '../contexts/ColorModeContext';

const ThemeSwitcher: React.FC = () => {
    const theme = useTheme();
    const { toggleColorMode } = useColorMode();

    return (
        <Tooltip title={`Switch to ${theme.palette.mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton onClick={toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeSwitcher; 