import React from 'react'
import TopBar from './TopBar.jsx'
import NetworkDisplay from './parameters/NetworkDisplay.jsx'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import io from 'socket.io-client'
import { useSnackbar } from 'notistack'
import { connect } from 'react-redux'

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

function App(props){
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  
  React.useEffect(() => {
    const socket = io()
    socket.on('console', (data) => {
      enqueueSnackbar(data)
    })
    socket.on('snapshot', (data) => {
      for (const [path, value] of Object.entries(data)) {
        props.dispatch({type: 'parameters/update', path: path, value: value})
      }
    })
  },
  [])

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <TopBar/>
        <NetworkDisplay/>
      </ThemeProvider>
  )
}

export default connect()(App)
