import React from 'react'
import ButtonAppBar from './TopBar.jsx'
import NetworkDisplay from './parameters/NetworkDisplay.jsx'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { SnackbarProvider } from 'notistack'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    primary: {main: "#67001a"},
    secondary: {main: '#004e67'},
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          background: 'linear-gradient(180deg, #e6e6e6 20%, #ffffff 90%)',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }
      }
    }
  }


})

export default function App(props){
  return (
    <SnackbarProvider maxSnack={3} preventDuplicate anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <ButtonAppBar/>
        <NetworkDisplay/>
      </ThemeProvider>
    </SnackbarProvider>
  )
}
