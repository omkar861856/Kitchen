import { useColorScheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectProps } from '@mui/material/Select';
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun (Light mode)
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon (Dark mode)
import DevicesIcon from '@mui/icons-material/Devices'; // Computer/PC icon (System mode)
import { Box } from '@mui/material';
import './ColorModeSelect.css';

export default function ColorModeSelect(props: SelectProps) {
  const { mode, setMode } = useColorScheme();

  if (!mode) {
    return null;
  }

  const renderIcon = (value: string) => {
    switch (value) {
      case 'light':
        return <Brightness7Icon sx={{ fontSize: '24px', margin: '0 auto' }} />;
      case 'dark':
        return <Brightness4Icon sx={{ fontSize: '24px', margin: '0 auto' }} />;
      case 'system':
        return <DevicesIcon sx={{ fontSize: '24px', margin: '0 auto' }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
      <Select
        value={mode}
        onChange={(event) => setMode(event.target.value as 'system' | 'light' | 'dark')}
        inputProps={{ 'data-screenshot': 'toggle-mode' }} // Corrected way to add custom attribute
        IconComponent={undefined} // Disabled dropdown arrow icon
        {...props}
        sx={{
          '& .MuiSelect-select': {
            paddingRight: 0,  // Remove padding-right
          }
        }}
      >
        <MenuItem value="system">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderIcon('system')}
          </Box>
        </MenuItem>
        <MenuItem value="light">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderIcon('light')}
          </Box>
        </MenuItem>
        <MenuItem value="dark">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderIcon('dark')}
          </Box>
        </MenuItem>
      </Select>
    </Box>
  );
}