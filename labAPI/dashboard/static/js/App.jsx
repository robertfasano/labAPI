import React from 'react'
import ButtonAppBar from './TopBar.jsx'
import NetworkDisplay from './parameters/NetworkDisplay.jsx'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import io from 'socket.io-client'
import { useSnackbar } from 'notistack'

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
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  React.useEffect(() => {
    const socket = io()
    socket.on('connect', (data) => {
      enqueueSnackbar('Connected to LabAPI server.', {variant: 'success'})
    })

    socket.on('console', (data) => {
      enqueueSnackbar(data)
    })
  },
  [])

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <ButtonAppBar/>
        <NetworkDisplay/>
      </ThemeProvider>
  )
}
